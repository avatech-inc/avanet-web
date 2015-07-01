var mongoose = require('mongoose'),
    async = require('async'),
    Test = mongoose.model('Test'),
    Profile = mongoose.model('Profile'),
    _ = require('underscore'),
    fs = require('fs'),
    md5 = require('MD5');

var knox = require('knox');
var s3 = knox.createClient({
    key: 'AKIAIQFLR4EQC63ZZTNQ'
  , secret: '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'
  , bucket: 'avatech-data'
});

function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}
function avg(values) {
    var total = 0;
    for(var i = 0; i < values.length; i++) total += values[i];
    return total / values.length;
}

function readString(buffer, start, length) {
    // get the string from the buffer, strip out null chars
    return buffer.toString('ascii', start, start + length).replace(/\u0000/g, '');
}

exports.checkUpload = function(req, res) {
    Test.find({ 'hash': { "$in": req.body.hashes }})
    .select("hash")
    .exec(function(err, docs){

        var hashes = [];
        for (var i = 0; i < docs.length; i++) hashes.push(docs[i].hash);

        var newHashes = []
        for (var i = 0; i < req.body.hashes.length; i++) {
            if (hashes.indexOf(req.body.hashes[i]) == -1) newHashes.push(req.body.hashes[i]);
        }

        res.json(newHashes);
    });
}

 // convert processed profile
 function convertProfile(fileData) {

  // utils

  function convertToString(uint8arr) {
    return String.fromCharCode.apply(null,uint8arr).replace(/\0/g, '');
  }

  // big endian as per iDevices BLE stack
  function int32toBytes(num) {
    arr = new Uint8Array([
         (num & 0x000000ff),
         (num & 0x0000ff00) >> 8,
         (num & 0x00ff0000) >> 16,
         (num & 0xff000000) >> 24
    ]);
    return arr;
  }
  function bytesToInt32(bytes) {
    var num = bytes[0] +
      bytes[1] * parseInt("0x0100") +
      bytes[2] * parseInt("0x010000") +
      bytes[3] * parseInt("0x01000000");
    return num;
  }
  function bytesToInt16(bytes) {
    var num = bytes[0] +
      bytes[1] * parseInt("0x0100");
    return num;
  }
  function bytesToFloat32(bytes) {
    var buffer = new Uint8Array([bytes[3], bytes[2], bytes[1], bytes[0]]);
    var view = new DataView(buffer.buffer);
    return view.getFloat32(0);
  }

  // -----------------

  var profile = {}
  profile.metaData = {}

  profile.metaData.latRaw = convertToString(fileData.subarray(0,16));
  profile.metaData.longRaw = convertToString(fileData.subarray(16,32));

  var _lat = parseFloat(convertToString(fileData.subarray(0,16)));
  var _long = parseFloat(convertToString(fileData.subarray(16,32)));

  if (isNaN(_lat) || isNaN(_long)) profile.location = null;
  else profile.location = [_long, _lat];

  profile.timeZone = convertToString(fileData.subarray(95,103));

  var time = convertToString(fileData.subarray(32,48));
  if (time.length == 8) time = time.substr(0,6);
  var date = convertToString(fileData.subarray(48,64));

  if (date.length == 8) {
    var timeOffset = profile.timeZone;
    timeOffset = timeOffset.replace(/:30/g,".5");
    timeOffset = timeOffset.replace(/:00/g,"");
    timeOffset = parseFloat(timeOffset);

    var year = parseInt(date.substr(0,4));
    var month = parseInt(date.substr(4,2));
    var day = parseInt(date.substr(6,2));

    var d;

    if (time.length == 6) {
      var hours = parseInt(time.substr(0,2));
      hours -= timeOffset;
      var minutes = parseInt(time.substr(2,2));
      var seconds = parseInt(time.substr(4,2));

      d = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    }

    profile.date = d;
  }
  else profile.date = null;

  profile.metaData.dateRaw = date;
  profile.metaData.timeRaw = time;

  profile.metaData.fileTypeId = convertToString(fileData.subarray(64,70));
  profile.deviceId = convertToString(fileData.subarray(70,84));

  profile.softwareVersion = convertToString(fileData.subarray(84,94));
  profile.metaData.fileProcessType = fileData.subarray(94,95)[0];

  profile.localTime = convertToString(fileData.subarray(103,119));

  profile.metaData.timeDelay = fileData.subarray(119,120)[0];
  profile.metaData.tipCondition = convertToString(fileData.subarray(120,122));

  profile.aspect = convertToString(fileData.subarray(122,126));
  if (profile.aspect == "N") profile.aspect = 0;
  else if (profile.aspect == "NW") profile.aspect = 315;
  else if (profile.aspect == "NE") profile.aspect = 45;
  else if (profile.aspect == "S") profile.aspect = 180;
  else if (profile.aspect == "SW") profile.aspect = 225;
  else if (profile.aspect == "SE") profile.aspect = 135;
  else if (profile.aspect == "E") profile.aspect = 90;
  else if (profile.aspect == "W") profile.aspect = 270;
  else profile.aspect = null;

  profile.metaData.threeTestAverage = fileData.subarray(126,127)[0];
  profile.metaData.warpedAverageProfile = fileData.subarray(127,128)[0];
  profile.metaData.threeTest1 = convertToString(fileData.subarray(128,136));
  profile.metaData.threeTest2 = convertToString(fileData.subarray(136,144));
  profile.metaData.threeTest3 = convertToString(fileData.subarray(144,152));

  profile.metaData.compassSampleCount = fileData.subarray(152,153)[0];

  profile.favorite = fileData.subarray(153,154)[0];
  profile.dateNumber = bytesToInt16(fileData.subarray(154,156));
  profile.dateNumberRaw = [
    fileData.subarray(154,156)[0],
    fileData.subarray(154,156)[1]];

  profile.slope = bytesToInt16(fileData.subarray(156,158));


  profile.metaData.sampleRate = bytesToFloat32(fileData.subarray(164,168));  
  profile.metaData.batteryVoltage = bytesToFloat32(fileData.subarray(168,172)); 


  profile.deviceProfileId = bytesToInt32(fileData.subarray(160,164)); 

  var hash = md5(profile.deviceId + profile.deviceProfileId);

  profile.hash = hash;

  // get rows
  var pressureStartIndex = 252;
  var rows = [];
  var rawRows = [];
  var lastRow = 0;
  for (var i = 0; i < 1500; i++) {
    var _byte = fileData.subarray(pressureStartIndex + i, pressureStartIndex + 1 + i)[0];
    rows.push(_byte);

    rawRows.push(_byte - lastRow);
    lastRow = _byte;
  }

  // trim bottom of rows
  var lastRow;
  for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i] > 0) { lastRow = i; break; }
  }
  if (lastRow != null) rows = rows.slice(0,lastRow);

  profile.rows = rows;

  profile.published = false;
  //profile.sharingLevel: 'private',
  //profile.shareWithAvyCenter: { type: Boolean, default: false },
  //profile.shareWithStudents: { type: Boolean, default: false },

  profile.created = new Date();

  return profile;

}

exports.upload = function(req, res) {

    //console.log("UPLOAD!");

    var buffer = new Uint8Array(req._readableState.buffer[0]);
    //console.log(buffer.length);

    var profile = convertProfile(buffer);
    console.log("UPLOADING: " + profile.hash);

    Test.findOne({ hash: profile.hash })
    .exec(function(err, test) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {

            // make sure test doesn't exist
            if (test == null) {

                var test = new Test(profile);
                test.user = req.user;
                test.type = 'test';
                test.version = 'v1';
                test.appVersion = 'web';
                test.depth = test.rows.length;

                test.rows_compressed = downsample(test.rows, 3);
                test.rows_small = downsample(test.rows, 5);
                test.rows_mini = downsample(test.rows, 10);
                test.rows_micro = compressRows(test.rows_mini, 4);

                console.log("saving! " + test.hash);
                test.save(function(err){
                  if (err) return res.json({ });
                  else return res.json({ hash: test.hash });
                });
            }
            // if already exists
            else res.json({ });
        }
    });
}

function downsample(rows, threshold) {
    var findAverage = function(data) {
      var total = 0;
      for (var i = 0; i < data.length; i++) {
          total += data[i];
      }
      return (total / data.length).toFixed(0);
    }

    var newRows = [];
    var samples = [];
    for (var i = 0; i < rows.length; i++) {
        samples.push(rows[i]);
        if (samples.length == threshold) {
            newRows.push(findAverage(samples));
            samples = [];
        }
    }
    if (samples.length) newRows.push(findAverage(samples));
    return newRows;
}

function updateField(obj, field, val) {
    if (val == null) return;
    obj[field] = val;
}

exports.create = function(req, res) {
    delete req.body.user;

    //req.body.hash = req.body.id;
    // remove forbidden fields
    delete req.body.id;
    delete req.body.user;

    var query = { hash: req.body.hash };
    if (req.body.hash == null && req.body._id != null) query = { _id: req.body._id };

    Test.findOne(query)
    //.select('-rows')
    .exec(function(err, test) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {

            // normalize sharedOrganizations
            if (req.body.sharedOrganizations && req.body.sharedOrganizations.length > 0) {
                var sharedOrganizations = [];
                for(var i = 0; i < req.body.sharedOrganizations.length; i++)
                    sharedOrganizations.push(req.body.sharedOrganizations[i]._id);
                req.body.sharedOrganizations = sharedOrganizations;
            }
            // normalize org
            if (req.body.organization) req.body.organization = req.body.organization._id;

            // already exists
            if (test) {
                // remove forbidden fields
                // delete req.body.rows;
                // delete req.body.rows_compressed;
                // delete req.body.rows_small;
                // delete req.body.depth;
                // delete req.body.type;

                console.log("already exists!!!!!");
                console.log(test._id);

                console.log(req.user._id);
                console.log(test.user);

                // make sure user matches! if not, don't allow to uplaod
                if (!req.user._id.equals(test.user)) {
                    console.log("not authorized to edit this profile!")
                    // todo: make 401 not authorized?
                    return res.json({});
                }

                // if already removed, do nothing
                if (test.removed) {
                    console.log("already removed!!!");
                    return res.json({});
                }

                // removed
                if (req.body.removed) {
                    console.log("removing !!!!!!!!");
                    test.removed = true;
                    test.updated = new Date();
                    test.save();
                    return res.json({});
                }

                // fields to be updated
                updateField(test, "appVersion", req.body.appVersion);
                updateField(test, "organization", req.body.organization);
                // publish settings
                updateField(test, "published", req.body.published);
                updateField(test, "sharingLevel", req.body.sharingLevel);
                updateField(test, "shareWithAvyCenter", req.body.shareWithAvyCenter);
                updateField(test, "shareWithStudents ", req.body.shareWithStudents);
                updateField(test, "sharedOrganizations", req.body.sharedOrganizations);

                updateField(test, "slope", req.body.slope);
                updateField(test, "aspect", req.body.aspect);
                updateField(test, "elevation", req.body.elevation);
                updateField(test, "location", req.body.location);
                updateField(test, "locationName", req.body.locationName);
                updateField(test, "notes", req.body.notes);

                test.updated = new Date();

                test.save();
                res.json({});
            }
            // doesnt exist, create
            else {

                // if removed before saving, we don't need to do anything special, 
                // it will just be marked as removed from the getgo
                // todo: should we still store rows and such...?

                if (req.body.removed) {
                  delete req.body.rows;
                }

                var test = new Test(req.body);
                test.user = req.user;
                test.type = 'test';
                test.version = 'v1';
                test.depth = test.rows.length;
                if (!req.body.removed) {
                  test.rows_compressed = downsample(test.rows,3);
                  test.rows_small = downsample(test.rows,5);
                  test.rows_mini = downsample(test.rows, 10);
                  test.rows_micro = compressRows(test.rows_mini, 4);
                }

                //console.log(test);
                console.log("saving! " + test.hash);

                test.save();
                res.json({});
            }
            //res.json(test);
        }
    });
    
    // test.user = req.user;
    // test.save();
    // test.save(function(err) {
    //     res.jsonp(test);
    // });
};


var compressRows = function(rows, n) {

    function splitInt(streak) {
        var streak1, streak2;//, streak3;
        // if (streak > 188) {
        //   streak1 = streak2 = 94;
        //   streak3 = streak - 188;
        // }
        // else 
        if (streak > 94) { // 94 = max ASCII printable values
          streak1 = 94;
          streak2 = streak - 94;
          //streak3 = 0;
        }
        else {
          streak1 = streak;
          streak2 = 0;
          //streak3 = 0;
        }
        return  String.fromCharCode(32 + streak1) +
                String.fromCharCode(32 + streak2);
                //+ String.fromCharCode(32 + streak3);
    }
    function unsplitInt(str) {
        if (str.length != 2) return null; // 3
        return  (str[0].charCodeAt(0) - 32) +
                (str[1].charCodeAt(0) - 32);
                // + (str[2].charCodeAt(0) - 32);
    }

    for (var r = 0; r < rows.length; r++) {
      rows[r] = Math.floor(rows[r] / n) + 32; // 32 is offset for ASCII printable chars
    }

    var str = String.fromCharCode.apply(String, rows);
    var chars = [];
    var prev = null;
    var streak = 1;
    for (var s = 0; s < str.length; s++) {
        var ch = str[s];
        if (ch == prev) streak++;
        else if (prev != null) {
            chars.push([prev, streak]);
            streak = 1;
        }
        prev = ch;
    }
    chars.push([prev, streak]);

    var str2 = "";
    for (var c = 0; c < chars.length; c++) {
        var ch = chars[c][0];
        var streak = chars[c][1];
        if (streak > 4) {
            // - newline = start
            // - int < 188 encoded as 2-char ascii
            // - ascii char
            str2 += "\n" + splitInt(streak) + ch; 
        }
        else {
            for (var k = 0; k < streak; k++) str2 += ch;
        };
    }
    return str2;

    // expand
    // var str3 = "";
    // for (var e = 0; e < str2.length; e++) {
    //     var ch = str2[e];
    //     if (ch != "\n") str3 += ch;
    //     else {
    //         var streak = str2.substr(e + 1, 2); //3
    //         streak = unsplitInt(streak);
    //         var _ch = str2[e+3]; //4
    //         for (var k = 0; k < streak; k++) str3 += _ch;
    //         e += 3; //4
    //     }
    // }
}

exports.fornow = function(req, res) {

  var stream = Test.find({ version: 'v1' }).stream();

  stream.on('data', function (test) {

    test.rows_mini = downsample(test.rows, 10);
    test.rows_micro = compressRows(test.rows_mini, 4);
    //test.rows_micro = compressRows(test.rows_mini, 3);

    test.save(function(err) {
      if (err) console.log(err);
      else console.log("SAVED!");
    });

    console.log("LEN : " + test.rows.length + "/" + test.rows_mini.length + "/" + test.rows_micro.length);
  
  }).on('error', function (err) {
    // handle the error
  }).on('close', function () {
    // the stream is closed
  });

    // Test.find({ version: 'v1' })
    // //.select('-rows')
    // .exec(function(err, tests) {

    //    console.log("TESTS: " + tests.length)

    //     for (var i = 0; i < tests.length; i++) {

    //       //(function(test) {
    //          //var test = tests[i];
    //         if (tests[i].rows.length > 0) {

    //           // tests[i].rows_mini = downsample(tests[i].rows, 10);
    //           // tests[i].rows_micro = compressRows(tests[i].rows_mini, 4);
    //           //test.rows_micro = compressRows(test.rows_mini, 3);

    //           tests[i].save(function(err) {
    //             console.log(err);
    //             console.log("hey?");
    //             if (err) console.log(err);
    //             else console.log("SAVED!");
    //           });

    //           //console.log(tests[i].save);

    //           //console.log("LEN  " + i + ": " + tests[i].rows.length + "/" + tests[i].rows_mini.length + "/" + tests[i].rows_micro.length);

    //         }

    //       //})(tests[i]);
         
    //     }

    // });
    res.json({});
};

exports.getAll = function(req, res) {

    var lastSync = new Date();
    // if (req.query.last == "null") lastSync = new Date("1900-01-01");
    // else lastSync.setTime(req.query.last);
    lastSync = new Date("1900-01-01");

    Test.find({ user: req.user, updated: { "$gt": lastSync } })
    .select('-rows -rows_small') //only rows_compressed
    .sort('-created')
    .populate('user', 'fullName student')
    .populate('organization','name type logoUrl')
    .populate('sharedOrganizations','name type logoUrl')
    .exec(function(err, tests) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            console.log("tests: " + tests.length);
            res.json(tests);
        }
    });
}

exports.update = function(req, res) {
    // var profile = req.profile;

    // profile = _.extend(profile, req.body);

    // profile.save(function(err) {
    //     res.jsonp(profile);
    // });




    // if not admin
    // if (!req.user.admin) {
    //     // user can only update themself - todo: maybe return 401/403?
    //     if (req.user._id != req.body._id) return res.json({});
    //     // remove forbidden fields
    //     delete req.body.admin;
    //     delete req.body.disabled;
    // }
    // remove forbidden fields
    //delete req.body.hashed_password;
    // delete req.body.salt;
    // delete req.body.username;
    // delete req.body.email;
    delete req.body.user;
    // remove _id from the model
    delete req.body._id;
    // update
    Profile.findOneAndUpdate({ _id: req.params.profileId }, req.body, { select: '-user' }, function(err, profile) {
        if (err) console.log(err);
        if (profile) res.json(profile);
        else res.json({});
    });
};

exports.downloadRawData = function(req, res) {

    // get metadata for all tests
    //var hashes = req.body.hashes.map(function(obj){ return obj.hash });
    //Test.find({ hash: {'$in': hashes }}).select('metaData hash')

    Test.find({ user: req.user, version: "v1" })
    .select('metaData hash rows location date dateNumber')
    .exec(function(err, tests) {
        if (err) { console.log(err); } 
        else {

            var archiver = require('archiver');
            var archive = archiver('zip');

            var fileCount = tests.length;
            var zipFileName = "AvaNet_SP1_Data_" + req.user._id;
            var processed = 0;

            console.log("TOTAL: " + fileCount);

            // zip stuff

            var stream = require('stream');
            var zipStream = new stream;
            zipStream.writable = true;
            zipStream.data = [];
            zipStream.write = function(buf) { zipStream.data.push(buf); }

            zipStream.end = function(buf) {
                if(arguments.length) zipStream.write(buf);
                zipStream.writable = false;
                var bytes = Buffer.concat(zipStream.data);

                // send zip to client
                // var dataUri = 'data:application/zip;base64,' + bytes.toString('base64');
                // res.json({ buffer: dataUri });

                var s3req = s3.put('/zips/' + zipFileName + '.zip', {
                    'Content-Length': bytes.length
                  , 'Content-Type': 'application/zip'
                  , 'x-amz-acl': 'public-read'
                });
                s3req.on('response', function(s3res){
                  if (200 == res.statusCode) {
                    console.log('saved to %s', s3req.url);
                    res.json({ url: s3req.url });
                  }
                });
                s3req.end(bytes);
            }

            // pipe zip stream to buffer
            archive.pipe(zipStream);

            //archive.append(req.body.metaData, { name: "_fieldtest.txt" })
            
            for (var i = 0; i < tests.length; i++) {

                var test = tests[i];

                // add raw data file to zip
                //archive.append(buffer, { name: fileName + ".hex" })

                // add converted data file to zip
                //archive.append(convertRaw(buffer), { name: fileName + ".csv" })

                // add metadata file to zip
                //archive.append(JSON.stringify(test.metaData), { name: fileName + ".json" })

                // todo: metadata

                var moment = require('moment');

                var content = '';

                // metadata

                // url
                // id
                // location
                // slope
                // angle
                content += "PROFILE ID:," + test._id + "\n";
                content += "URL:," + "https://avanet.avatech.com/t/" + test._id + "\n";

                content += "DATE:," + moment(test.date).format("YYYY-MM-DDTHH:mm") + "\n";
                content += "DATE #:," + test.dateNumber + "\n";

                content += "SLOPE:," + (test.slope ? test.slope : "") + "\n";
                content += "ASPECT:," + (test.aspect ? test.aspect : "") + "\n";
                content += "LOCTATION:,";
                if (test.location) content+= test.location[1] + "," + test.location[0];
                content += "\n";

                content += "\n";
                content += "DEPTH (mm), PRESSURE (kPa)\n";

                //console.log(content);

                if (test.rows) {
                  for (var r = 0; r < test.rows.length; r++) {
                    var pressure = test.rows[r];

                    var pressure_expanded = (.00008 * Math.pow(pressure,3));

                    content += (r + 1) + "," + pressure_expanded + "\n";
                  }
                  archive.append(content, { name: test._id + "_" + moment(test.date).format("YYYY-MM-DDTHH:mm") + "_" + test.dateNumber + ".csv" })
                }

                processed++;
                if (processed == fileCount) {
                    console.log("FINISHING!");
                    // zip it up
                    archive.finalize();
                }
            }
        }
    });
};

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
     bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function convertRaw(buffer) {
    var rawFileText = "V_Pressure,V_Irdms,V_Qrd,\n";
    var fileSize = buffer.length / 2;
    var index = 0;
    var pos = 0;
    while (fileSize != 0) {   
        fileSize--;
        index++;

        var test = buffer.readUInt16BE(pos);
        test=((test*3.3)/65535); 
        rawFileText += test.toFixed(6).toString() + ",";

        pos += 2;

        if (index == 3) {
            index=0;
            rawFileText += "\n";
        }
    }
    return rawFileText;
}

function downloadFile(hash, newFileName, callback) {

        var fileName = '/raw-profiles/' + hash + ".hex";
        // download file from s3
        s3.getFile(fileName, function(err, file){
            console.log("DONE!");
            console.log(err);

            if (!err) {

                var buffer = new Buffer(0);
                file.on('data', function(chunk) { 
                    buffer = Buffer.concat([buffer, chunk]);
                });
                file.on('end', function() {
                    callback(hash, newFileName, buffer);
                });
            }
        });
}

exports.destroy = function(req, res) {
    var profile = req.profile;

    profile.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(profile);
        }
    });
};

exports.show = function(req, res) {
    var id = req.params.testId;
    
    Test.findOne({ _id: id, removed: { "$ne": true } })
    // only return rows_compressed
    .select('-rows -rows_small')
    .populate('user', 'fullName student')
    .populate('organization','name type logoUrl')
    .lean()
    .exec(function(err, test) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.json(test);
        }
    });
};

exports.all = function(req, res) {


    var query = { user: req.user  };
    if (req.user.admin) {
        query = { user: {'$ne': '52ded75ea5a539d772000001' }}
        if (req.user._id != '52e48c646082d09157000002');
            query = { user: {'$nin': ['52e48c646082d09157000002','52ded75ea5a539d772000001'] }}
    }

    //query = { user: "532dae015720a1df17e4be85" };
    Test.find(query).select('-rows -rows_compressed -metaData -hash')
    .sort('-created')
    .populate('user','fullName')
    .exec(function(err, tests) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(tests);
        }
    });
};

// var jpeg = require('jpeg-js');
// exports.thumb = function(req, res) {

//     var id = req.params.testId;
//     Test.findOne({ _id: id, removed: { "$ne": true } })
//     // only return rows_compressed
//     .select('rows_small')
//     .lean()
//     .exec(function(err, test) {
//         if (err) {
//             res.render('error', {
//                 status: 500
//             });
//         } else {

//             var width = 300, height = 300;
//             var frameData = new Buffer(width * height * 4);

//             var color_on = [51,51,51];
//             var color_off = [238,238,238];
//             var color_none = [190,190,190];

//             var pixels = [];
//             for (var y = 0; y < height; y++) {
//                 for (var x = 0; x < width; x++) {

//                     if (y >= test.rows_small.length) {
//                       pixels.push(color_none);
//                       continue;
//                     }

//                     var pressure_expanded = (.00008 * Math.pow(test.rows_small[y],3));

//                     var A_P4 = -194.1;
//                     var B_P4 = .1304;
//                     var C_P4 = -.0023124;
//                     var D_P4 = 197.7;
//                     var pressure_graph = (A_P4 * (Math.pow(B_P4 , -C_P4 * pressure_expanded)) + D_P4) * (217/198);

//                     pressure_graph = pressure_graph * (width / 212);

//                     if (x > pressure_graph) pixels.push(color_off);
//                     else pixels.push(color_on);
//                 }
//             }

//             // plot pixels
//             var f = 0;
//             for (var p = 0; p < pixels.length; p++) {
//                 frameData[f + 0] = pixels[p][0];
//                 frameData[f + 1] = pixels[p][1];
//                 frameData[f + 2] = pixels[p][2];
//                 frameData[f + 3] = 0;
//                 f += 4;
//             } 


//             // var f = 0;
//             // for (var i = 0; i < pixels.length; i++) {

//             // }

//             // var i = 0;
//             // while (i < frameData.length) {
//             //   frameData[i++] = pixels[i][0]; // red
//             //   frameData[i++] = pixels[i][1]; // green
//             //   frameData[i++] = pixels[i][2]; // blue

//             //   frameData[i++] = 0xFF; // alpha - ignored in JPEGs
//             // }

//             var rawImageData = {
//               data: frameData,
//               width: width,
//               height: height
//             };
//             var jpegImageData = jpeg.encode(rawImageData, 50);

//             res.set('Content-Type', 'image/jpeg');
//             res.send(jpegImageData.data);

//         }
//     });
// }