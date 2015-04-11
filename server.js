// init newrelic
require('newrelic');

var express = require('express');
var fs = require('fs');
var passport = require('passport');

// register models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
});

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    auth = require('./config/authorization'),
    mongoose = require('mongoose');

// connect to db
var db = mongoose.connect(config.db);

// register passport config
require('./config/passport')(passport, config);

var app = express();

// express settings
require('./config/express')(app, config, passport);

// register routes
require('./config/routes')(app, passport, auth);

// start it up
var port = process.env.PORT || 3000;
app.listen(port);
console.log('AvaTech is up and running on port ' + port);

exports = module.exports = app;