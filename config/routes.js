var async = require('async');
var auth = require('./auth');
var path = require('path');

module.exports = function(app) {

    var obs = require('../app/controllers/observations');
    var profiles = require('../app/controllers/profiles');
    var tests = require('../app/controllers/tests');

    // NOT PORTED:

    // User

    // app.get('/v1/users', auth.requireLogin, auth.requireAdmin, users.getAll);
    // app.get('/v1/users/:userId/stats', auth.requireLogin, auth.requireAdmin, users.getUserStats);

    // Organizations

    // app.get('/v1/orgs/education/:orgHashId', orgs.showEducation);
    // app.get('/v1/orgs/all', auth.requireLogin, auth.requireAdmin, orgs.getAll);

    // ---------------------------------------------------------

    // todo: these return ALL observation types - maybe replace this with "observations"
    // and rename "observations" to "avalanches"?
    app.get('/v1/all-observations', auth.requireLogin, profiles.all);
    app.get('/v1/all-observations/mine', auth.requireLogin, profiles.allMine);

    // Manual Profiles
    app.post('/v1/profiles', auth.requireLogin, profiles.create);
    app.put('/v1/profiles/:profileId', auth.requireLogin, profiles.update);
    app.get('/v1/profiles/:profileId', auth.requireLogin, profiles.show);
    app.delete('/v1/profiles/:profileId', auth.requireLogin, profiles.destroy);

    // Device Profiles

    app.get('/v1/tests', auth.requireLogin, tests.getAll);
    app.post('/v1/tests', auth.requireLogin, tests.create);
    app.post('/v1/tests/checkUpload', auth.requireLogin, tests.checkUpload);
    app.post('/v1/tests/upload', auth.requireLogin, tests.upload);
    app.get('/v1/tests/downloadData', auth.requireLogin, auth.requirePermission('bulkDownload'), tests.downloadRawData);
    app.get('/v1/tests/:testId', auth.requireLogin, tests.show);

    // Avalanche Observations

    app.post('/v1/observations', auth.requireLogin, obs.create);
    app.get('/v1/observations/:observationId', auth.requireLogin, obs.show);
    app.put('/v1/observations/:observationId', auth.requireLogin, obs.update);
    app.delete('/v1/observations/:observationId', auth.requireLogin, obs.destroy);

    // ---------------------------------------------------------



    // File Upload

    var multiparty = require('multiparty');
    var uuid = require('node-uuid');
    var knox = require('knox');
    var s3 = knox.createClient({
        key: 'AKIAIQFLR4EQC63ZZTNQ'
      , secret: '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'
      , bucket: 'avatech-uploads'
    });

    app.post('/upload', function(req, res) {
        console.log("UPLAODING!");

        var form = new multiparty.Form();
     
        form.parse(req, function(err, fields, files) {
            var file = files.fileData[0];
            if (!file) return;

            var fileName = uuid.v1().toString().replace(/-/g, "");
            fileName = '/snowpit-files/' + fileName + ".jpg";

            // upload to s3
            s3.putFile(file.path, fileName,
                { 'Content-Type': 'image/jpeg', 'x-amz-acl': 'public-read' }, function(err, _res) {
                if (err) console.log(err);
                else console.log("file uploaded!");
                _res.resume();
                res.json({ url: "https://s3.amazonaws.com/avatech-uploads" + fileName });
            });

        });

    });

    //--------------------------------------------------------------------------------

    // SMS

    var twilio = require('twilio')('AC90cc3e804675a5a3decaee1caac5f953', '92573d2ace3cea138517f2f76fc28689');
    app.get('/send-app-sms', function(req,res) {
        console.log("hey!");
        console.log(req.query.num);

        twilio.sendMessage({

            to: req.query.num, // Any number Twilio can deliver to
            from: '+14355039000', // A number you bought from Twilio and can use for outbound communication
            body: 'Download the AvaNet app: https://avanet.avatech.com/app' // body of the SMS message

        }, function(err, responseData) { //this function is executed when a response is received from Twilio

            console.log(responseData);
            if (!err) { // "err" is an error received during the request, if any

                // "responseData" is a JavaScript object containing data received from Twilio.
                // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
                // http://www.twilio.com/docs/api/rest/sending-sms#example-1

                // console.log(responseData.from); // outputs "+14506667788"
                // console.log(responseData.body); // outputs "word"

            }
        });

        res.json({});
    });
    
    app.get('/test500', function(req,res) { res.json(nonExistentVariable); });

    app.get('/manifest.plist', function(req,res) { 
        res.sendFile(path.join(__dirname, '../app/views', 'manifest.plist'));
    });
    app.get('/download-app', function(req,res) { 
        res.sendFile(path.join(__dirname, '../app/views', 'download-app.hyml'));
    });
    app.get('/app', function(req,res) { 
        res.sendFile(path.join(__dirname, '../app/views', 'download-app.html'));
    });

    var s3_2 = knox.createClient({
        key: 'AKIAIQFLR4EQC63ZZTNQ'
      , secret: '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'
      , bucket: 'sp1manual'
    });

    var getManual = function(req,res) {
        s3_2.list({ }, function(err, data) {

            var manual_en = "";
            var manual_fr = "";

            if (data.Contents && data.Contents.length > 0) {

                for (var i = 0; i < data.Contents.length; i++) {
                    if (data.Contents[i].Key.toLowerCase().indexOf("english") > -1) manual_en = data.Contents[i].Key;
                    else if (data.Contents[i].Key.toLowerCase().indexOf("french") > -1) manual_fr = data.Contents[i].Key;
                }

                if (!req.query.l|| (manual_en != "" && req.query.l.toLowerCase() == "en")) {
                    return res.redirect("https://s3.amazonaws.com/sp1manual/" + manual_en);
                }
                else if (manual_fr != "" && req.query.l.toLowerCase() == "fr") {
                    return res.redirect("https://s3.amazonaws.com/sp1manual/" + manual_fr);
                }
            }
            return res.json({});
        });
    };
    app.get('/SP1manual', getManual);
    app.get('/sp1manual', getManual);
    app.get('/manual', getManual);

    app.get('*', function(req,res) { 

        //console.log("ACCEPT HEADERS: " + req.headers.accept);

        res.sendFile(path.join(__dirname, '../app/views', 'main.html'));
    });
};