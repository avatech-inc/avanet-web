/**
 * Module dependencies.
 */
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var compression = require('compression')
var raven = require('raven');

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

    // error handling
    var ravenClient = new raven.Client('https://5097e04eae554a3f93095b66a6b783a8:dc1da163702549ac87dc3d064d3a2619@app.getsentry.com/41540');
    var parsers = raven.parsers;
    //app.use(raven.middleware.express('https://5097e04eae554a3f93095b66a6b783a8:dc1da163702549ac87dc3d064d3a2619@app.getsentry.com/41540'));
    //client.captureError(error, {extra:{user: { id: 'foobar' }}});

    app.use(function(err, req, res, next) {

      var ravenOptions = parsers.parseRequest(req);
      if (req.user) {
          ravenOptions.user = { 
            id: req.user._id,
            email: req.user.email,
            name: req.user.fullName
        };
      }
      ravenClient.captureError(err, ravenOptions);
      console.error(err);
      if (req.xhr) {
        res.status(500).send({ error: '500 Error' });
      } else {
        //next(err);
        //res.status(500).sendFile('../app/views/500.html', { root: __dirname });
        res.status(500).sendFile(path.join(__dirname, '../app/views', '500.html'));
      }
    });


    // //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    // app.use(function(err, req, res, next) {
    //     //Treat as 404
    //     //if (~err.message.indexOf('not found')) return next();

    //     //Log it
    //     console.error(err.stack);

    //     //Error page
    //     res.status(500).render('500', {
    //         error: err.stack
    //     });
    // });
};