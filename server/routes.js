var async = require('async');
var path = require('path');

module.exports = function(app) {

    // NOT PORTED:

    // User
    // app.get('/v1/users/:userId/stats', auth.requireLogin, auth.requireAdmin, users.getUserStats);

    // Organizations
    // app.get('/v1/orgs/education/:orgHashId', orgs.showEducation);

    // ---------------------------------------------------------

    // Device Profiles
    // this handles both create and update
    // app.post('/v1/tests', auth.requireLogin, tests.create);
    // app.get('/v1/tests', auth.requireLogin, tests.getAll);
    // app.post('/v1/tests/checkUpload', auth.requireLogin, tests.checkUpload);
    // app.post('/v1/tests/upload', auth.requireLogin, tests.upload);
    // app.get('/v1/tests/downloadData', auth.requireLogin, auth.requirePermission('bulkDownload'), tests.downloadRawData);
    // app.get('/v1/tests/:testId', auth.requireLogin, tests.show);

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
    
    //app.get('/test500', function(req,res) { res.json(nonExistentVariable); });

    // app.get('/download-app', function(req,res) { 
    //    res.sendFile(path.join(__dirname, './views', 'download-app.html'));
    // });
    app.get('/app', function(req,res) { 
        res.sendFile(path.join(__dirname, './views', 'download-app.html'));
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
        res.sendFile(path.join(__dirname, './views', 'main.html'));
    });
};