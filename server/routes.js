var async = require('async');
var path = require('path');

module.exports = function(app) {

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

    app.get('/download-app', function(req,res) { 
        res.sendFile(path.join(__dirname, './views', 'download-app.html'));
    });
    app.get('/app', function(req,res) { 
        res.sendFile(path.join(__dirname, './views', 'download-app.html'));
    });

    // wildcard
    app.get('*', function(req,res) { 
        res.sendFile(path.join(__dirname, './views', 'main.html'));
    });
};