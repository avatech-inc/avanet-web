var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var compression = require('compression')
var path = require('path');
var root = path.normalize(__dirname + '/..');

module.exports = function(app) {
    app.set('showStackError', true);

    // compress
    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css|html/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // favicon
    app.use(favicon(root + '/public/img/favicon.png'));

    // serve static content
    app.use(express.static(root + '/public'));

    //Don't use logger for test env
    //if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
    //}

    // enable jsonp
    app.enable("jsonp callback");

    // force HTTPS when in production (not guaranteed to work outside of nodejitsu, might work on heroku)
    app.use(function(req, res, next) {
        if (process.env.NODE_ENV && process.env.NODE_ENV == "production" && req.headers['x-forwarded-proto'] == 'http') {
            console.log("REDIRECTING TO HTTPS: https://" + req.get('host') + req.url);
            res.redirect("https://" + req.get('host') + req.url);
        }
        else next();
    });

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json());
    app.use(methodOverride());

    // register routes
    require('./routes')(app);

    app.use(function(err, req, res, next) {
      console.error(err);

      if (req.xhr) {
        res.status(500).send({ error: '500 Error' });
      } else {
        res.status(500).sendFile(path.join(__dirname, './views', '500.html'));
      }
    });
};