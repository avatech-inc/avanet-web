var async = require('async');
var auth = require('./auth');
var path = require('path');

module.exports = function(app, passport) {

    var users = require('../app/controllers/users');
    var tests = require('../app/controllers/tests');
    var orgs = require('../app/controllers/organizations');
    var obs = require('../app/controllers/observations');
    var comments = require('../app/controllers/comments');

    var fs = require("fs"); //Load the filesystem module

    // todo: duplicate of controllers/users.js!!!!!!!!!!!!!
    // var jwt = require('jwt-simple');
    // var jwt_secret = "guyute";

    // login
    // app.post('/v1/users/login', function(req, res, next) {
    //   passport.authenticate('local', function(err, user, info) {
    //     //if (err) { return next(err); }
    //     if (err){
    //         console.log("LOGIN ERROR 1!");
    //         console.log(err);
    //     }
    //     if (!user) { return res.json({ success: false, error: info.error }); }

    //     var client_user = {
    //         _id: user._id,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         fullName: user.fullName,
    //         admin: user.admin,
    //         location: user.location,
    //         settings: user.settings,
    //         permissions: user.permissions,
    //         student: user.student,
    //         country: user.country
    //     };

    //     var payload = { id: user._id };
    //     var token = jwt.encode(payload, jwt_secret);;
    //     return res.json({ success: true, token: token, user: client_user });

    //   })(req, res, next);
    // });

    // forgot/reset password
    // app.post('/v1/users/forgot-password', users.forgotPassword);
    // app.get('/v1/users/reset-password/:forgotPasswordToken', users.checkForgotPassword);
    // app.post('/v1/users/reset-password', users.resetPassword);

    // user

    // register new user
    //app.post('/v1/users', users.create);
    // search users
    //app.get('/v1/users/search', auth.requireLogin, users.search);
    // update user
    //app.put('/v1/users/:userId', auth.requireLogin, users.updateUser);
    // change password
    //app.post('/v1/users/:userId/change-password', auth.requireLogin, users.changePassword);
    // get pending user
    //app.get('/v1/users/pending/:userHashId', users.getPending);
    // get user
    //app.get('/v1/users/:userId', auth.requireLogin, users.show);

    // admin only:

    // get all users
    app.get('/v1/users', auth.requireLogin, auth.requireAdmin, users.getAll);
    // get user stats
    app.get('/v1/users/:userId/stats', auth.requireLogin, auth.requireAdmin, users.getUserStats);

    // Manual Profiles

    var profiles = require('../app/controllers/profiles');

    // todo: these return ALL observation types - maybe replace this with "observations"
    // and rename "observations" to "avalanches"?
    app.get('/v1/all-observations', auth.requireLogin, profiles.all);
    app.get('/v1/all-observations/mine', auth.requireLogin, profiles.allMine);

    app.post('/v1/profiles', auth.requireLogin, profiles.create);
    app.put('/v1/profiles/:profileId', auth.requireLogin, profiles.update);
    app.get('/v1/profiles/:profileId', auth.requireLogin, profiles.show);
    app.delete('/v1/profiles/:profileId', auth.requireLogin, profiles.destroy);

    // Device Profiles

    var tests = require('../app/controllers/tests');
    app.get('/v1/tests', auth.requireLogin, tests.getAll);
    app.post('/v1/tests', auth.requireLogin, tests.create);
    app.post('/v1/tests/checkUpload', auth.requireLogin, tests.checkUpload);
    app.post('/v1/tests/upload', auth.requireLogin, tests.upload);
    app.get('/v1/tests/downloadData', auth.requireLogin, auth.requirePermission('bulkDownload'), tests.downloadRawData);
    app.get('/v1/tests/:testId', auth.requireLogin, tests.show);
    //app.get('/v1/tests/:testId/thumb.jpg', tests.thumb);

    // Organizations

    app.post('/v1/orgs', auth.requireLogin, orgs.create);
    app.put('/v1/orgs/:orgId', auth.requireLogin, orgs.update);
    // get logged-in users's orgs
    //app.get('/v1/orgs', auth.requireLogin, orgs.getUserOrgs);
    // get all orgs (admin only)
    app.get('/v1/orgs/search', auth.requireLogin, orgs.search);
    //app.get('/v1/orgs/:orgId', auth.requireLogin, orgs.show);
    app.get('/v1/orgs/education/:orgHashId', orgs.showEducation);
    // Organization Members
    //app.get('/v1/orgs/:orgId/members', auth.requireLogin, orgs.members_all);
    //app.post('/v1/orgs/:orgId/members', auth.requireLogin, orgs.members_add);
    //app.put('/v1/orgs/:orgId/members/:memberId', auth.requireLogin, orgs.members_update);
    //app.delete('/v1/orgs/:orgId/members/:memberId', auth.requireLogin, orgs.members_remove);

    // admin only: 

    app.get('/v1/orgs/all', auth.requireLogin, auth.requireAdmin, orgs.getAll);

    // Observations

    app.post('/v1/observations', auth.requireLogin, obs.create);
    app.get('/v1/observations', auth.requireLogin, obs.all);
    app.get('/v1/observations/:observationId', auth.requireLogin, obs.show);
    app.put('/v1/observations/:observationId', auth.requireLogin, obs.update);
    app.delete('/v1/observations/:observationId', auth.requireLogin, obs.destroy);

    // Comments

    app.get('/v1/comments/:ownerType/:ownerId', auth.requireLogin, comments.all);
    app.post('/v1/comments/:ownerType/:ownerId', auth.requireLogin, comments.create);
    app.delete('/v1/comments/:commentId', auth.requireLogin, comments.destroy);

    // Devices

    var Device = require('mongoose').model('Device');
    app.post('/v1/devices/:serialNumber/register', auth.requireLogin, function(req,res) {
        Device.findOne({ serial: req.params.serialNumber }).exec(function(err,device){
            if (!device) {
                //return res.json({ error: "The serial number you entered is not valid. Please double check and try again." });
                device = new Device();
                device.serial = req.params.serialNumber;
                device.verified = false;
                device.user = req.user;
                device.save();
                return res.json({ registered: req.params.serialNumber });
            }
            else if (device.user && device.user.equals(req.user._id)) {
                return res.json({ error: "You have already registered this device." });
            }
            else if (device.user) {
                return res.json({ error: "This device has already been registered." });
            }
            else  {
                // register
                device.user = req.user;
                device.save();
                return res.json({ registered: req.params.serialNumber });
            }
        });
        //
    });

    // Snowpit Editor File Upload

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
    // Stripe Checkout
    //--------------------------------------------------------------------------------

    var Order = require('mongoose').model('Order');
    app.get('/fizblix', auth.requireLogin, auth.requireAdmin, function(req,res) {
        Order.find({}, '-last4 -cardType -stripeCustomerId -stripeChargeId', function(err, orders) {
            res.json(orders);
        });
    });

    // var OrderCoupon = require('mongoose').model('OrderCoupon');
    // app.get('/check/:code', function(req,res) {
    //     console.log("CODE:");
    //     console.log(req.params.code);

    //     // for(var i = 0; i < 500; i++) {
    //     //     var code = _codes[i];
    //     //     var price = 0;
    //     //     if (i > 400) price = 1249;
    //     //     else if (i > 300) price = 1499;
    //     //     else if (i > 100) price = 1799;

    //     //     var orderCoupon = new OrderCoupon({
    //     //         code: code,
    //     //         price: price
    //     //     });

    //     //     console.log(orderCoupon);
    //     //     orderCoupon.save();
    //     // }

    //     // OrderCoupon.find({}, '-last4 -cardType -stripeCustomerId -stripeChargeId', function(err, orders) {
    //     //     res.json(orders);
    //     // });
        
    //     // OrderCoupon.findOne({ code: req.params.code }, '', function(err, coupon) {
    //     //     console.log(coupon);
    //     //     if (coupon && !coupon.used) res.json({ price: coupon.price });
    //     //     else res.json({ error: "coupon code invalid" });
    //     // });



    //     OrderCoupon.findOne({ code: req.params.code }, '', function(err, coupon) {
    //         console.log(coupon);
    //         if (coupon && !coupon.used) res.json({ price: coupon.price });
    //         else res.json({ error: "coupon code invalid" });
    //     });
    // });

    // var Mail = require('./mail');
    // app.get('/', function(req,res) { 

    //     // OrderCoupon.find({ price: 1799 }, '', function(err, coupons) {
    //     //     for (var i = 0; i < coupons.length; i++) {
    //     //         var coupon = coupons[i];
    //     //         console.log("https://shop.avatech.com/" + coupon.code);
    //     //     }
    //     // });
    
    //     // console.log("IS AJAX?");
    //     // console.log(req.xhr ); // <-- why is this always false?
    //    // res.sendFile('./app/views/shop.html'); 
    //    res.sendFile(path.join(__dirname, '../app/views', 'shop.html'));
    // });
    // app.get('/:code', function(req,res) { 
    // //     res.sendFile('./app/views/shop.html'); 
    //    res.sendFile(path.join(__dirname, '../app/views', 'shop.html'));
    // });
    // //var stripe = require("stripe")("sk_test_4aIRRVQxRx3O7AdeJDRyUJxm");
    // var stripe = require("stripe")("sk_live_4aIR5CxiSGOosXIEtZgxCUFi");
    // app.post('/newOrder', function(req,res) {

    //     console.log(req.body);

    //     if (req.body.order.coupon && req.body.order.coupon != "") {
    //         OrderCoupon.findOne({ code: req.body.order.coupon }, '', function(err, coupon) {
    //             if (coupon && !coupon.used) processOrder(req, res, coupon.price);
    //             else {
    //                 res.json({ error: "The coupon code you provided is invalid." });
    //             }
    //         });
    //     }
    //     else {
    //         processOrder(req, res, 2249);
    //     }


    // }); 

    // var processOrder = function(req, res, price) {

    //     var email = req.body.token.email;

    //     // calculate order
    //     var deposit = 600;

    //     var order = req.body.order;


    //     order.quantity = parseInt(order.quantity);
    //     //order.shippingSameAsBilling = (order.shippingSameAsBilling == 'true' ? true : false);
    //     //order.payInFull = (order.payInFull == 'true' ? true : false);

    //     // if shipping same as billing, keep track
    //     if (order.shippingSameAsBilling) {
    //         console.log("SHIPPING SAME AS BILLING!");

    //         order.shipping_name = order.billing_name;
    //         order.shipping_address = order.billing_address;
    //         order.shipping_address2 = order.billing_address2;
    //         order.shipping_city = order.billing_city;
    //         order.shipping_state = order.billing_state;
    //         order.shipping_postal = order.billing_postal;
    //         order.shipping_country = order.billing_country;
    //     }
    //     else {
    //         console.log("shipping IS NOT same as billing!")
    //     }

    //     if (!order.quantity || order.quantity == 0 || isNaN(order.quantity)) return res.json({ error: "There was an error processing your order. Please try again." });;

    //     // subtotal
    //     var subtotal = order.quantity * price;

    //     // shipping
    //     var shipping = 0;
    //     if (order.shipping_country && order.shipping_country == "United States") {
    //         shipping = 15;
    //     }

    //     // sales tax
    //     var tax = 0;
    //     if (order.shipping_country && order.shipping_country == "United States" && order.shipping_postal && order.shipping_postal.length >= 5 && order.shipping_postal.indexOf("84") == 0) {
    //         tax = subtotal * .075;
    //     }

    //     // total
    //     var total = subtotal + shipping + tax;

    //     // calcualte final amount
    //     var amount = deposit * order.quantity;
    //     if (order.payInFull == true) amount = total;


    //     var stripeAmount = Math.ceil(amount * 100);

    //     console.log("total: " + total);
    //     console.log("final amount: " + stripeAmount)

    //     order.subtotal = subtotal;
    //     order.shipping = shipping;
    //     order.tax = tax;
    //     order.total = total;
    //     order.price = price;


    //     // create customer
    //     stripe.customers.create({
    //       card: req.body.token.id,
    //       email: email,
    //       description: 'Test User'

    //     }).then(function(customer) {

    //         console.log("customer created:");
    //         console.log(customer);

    //         // pro_name: "Andrew Sohn",
    //         // pro_email: "andrewsohn@gmail.com",
    //         // pro_org: "Org, Inc.",
    //         // pro_jobTitle: "Job Title",
    //         // pro_profession: "Other",

    //         // billing_name: "Andrew Sohn",
    //         // billing_address: "123 Fake St",
    //         // billing_address2: "Apt. 1",
    //         // billing_city: "Park City",
    //         // billing_state: "UT",
    //         // billing_postal: "84321",
    //         // billing_country: "United States",

    //         // shipping_name: "Andrew Sohn",
    //         // shipping_address: "123 Fake St",
    //         // shipping_address2: "Apt. 1",
    //         // shipping_city: "Park City",
    //         // shipping_state: "UT",
    //         // shipping_postal: "84321",
    //         // shipping_country: "United States",

    //       return stripe.charges.create({
    //         amount: stripeAmount, // amount in cents, again
    //         currency: "usd",
    //         customer: customer.id
    //         //metadata: { order: order }
    //       });

    //     })
    //     // after customer has been charged
    //     .then(function(charge) {

    //         console.log("CHARGE:");
    //         console.log(charge);

    //         console.log("saving order");
    //         console.log(order);

    //         order.orderid = charge.id.substr(3,8);

    //         // send receipt
    //         var html = "Hello " + order.pro_name;
    //         html+= "<br><br>";
    //         html+= "<b>Thank you for preordering the AvaTech SP1!</b>"
    //         html+= "<br><br>";
    //         html+= "Order Confirmation: " + order.orderid;
    //         html+= "<br><br>";

    //         var ifValid = function(str) {
    //             if (str != null && str != undefined && str != "") return str + "<br/>";
    //             else return "";
    //         };

    //         if (order.shippingSameAsBilling) html+= "<b>Billing & Shipping Address:</b><br/>";
    //         else html+= "<b>Billing Address:</b><br/>";
    //         html+= ifValid(order.billing_name);
    //         html+= ifValid(order.billing_address);
    //         html+= ifValid(order.billing_address2);
    //         html+= ifValid(order.billing_city);
    //         html+= ifValid(order.billing_state);
    //         html+= ifValid(order.billing_postal);
    //         html+= ifValid(order.billing_country);

    //         if (!order.shippingSameAsBilling) {
    //             html+= "<br/><b>Shipping Address:</b><br/>";
    //             html+= ifValid(order.shipping_name);
    //             html+= ifValid(order.shipping_address);
    //             html+= ifValid(order.shipping_address2);
    //             html+= ifValid(order.shipping_city);
    //             html+= ifValid(order.shipping_state);
    //             html+= ifValid(order.shipping_postal);
    //             html+= ifValid(order.shipping_country);
    //         }

    //         html+= "<br>";
    //         if (!order.payInFull) {
    //             html+= "<b>Deposit paid:</b> $" + (order.quantity * deposit).toFixed(2) + " charged to: " + charge.card.brand + " " + charge.card.last4;
    //             html+= "<br/>";
    //             html+= "<b>Balance:</b> $" + (order.total - (order.quantity * deposit)).toFixed(2) + " ";
    //             if (order.shipping_country != "United States") html+= "plus shipping* "
    //             html += "(charged to your card before ship date in December 2014)"

    //             if (order.shipping_country != "United States"){
    //                 html+= "<br><br>";
    //                 html+= "<b>* Please note that your balance is subject to additional international shipping fees.</b> We will contact you with a shipping quote within 2 weeks of ship date."
    //             }
    //         }
    //         else {
    //             html+= "<b>Paid:</b> $" + (order.total).toFixed(2) + " charged to: " + charge.card.brand + " " + charge.card.last4;

    //             if (order.shipping_country != "United States"){
    //                 html+= "<br><br>";
    //                 html+= "<b>Please note that your order is subject to additional international shipping fees.</b> We will contact you with a shipping quote within 2 weeks of ship date."
    //             }
    //         }

    //         html+= "<br><br>";
    //         html+= "Don't forget to sign up for AvaNet - inlcuded free for 1 year!<br/>https://avanet.avatech.com/register"
    //         html+= "<br><br>";
    //         html+= "Thank you,<br/>";
    //         html+= "<i>Team AvaTech</i>";

    //         console.log(html);

    //         Mail.sendMessage(html,
    //         "Thank you for preordering the SP1",
    //             { email: email }
    //         );


    //         // save order
    //         var _order = new Order({
    //             email: email,
    //             last4: charge.card.last4,
    //             cardType: charge.card.brand,
    //             stripeCustomerId: charge.card.customer,
    //             stripeChargeId: charge.id,
    //             order: order
    //         });
    //         _order.save();

    //         // mark coupon code as used
    //         if (order.coupon && order.coupon != "") {
    //             OrderCoupon.findOne({ code: order.coupon }, '', function(err, coupon) {
    //                 console.log(coupon);
    //                 if (coupon) coupon.used = true;
    //                 coupon.save();
    //                 // if (coupon && !coupon.used) res.json({ price: coupon.price });
    //                 // else res.json({ error: "coupon code invalid" });
    //             });
    //         }

    //         //saveStripeCustomerId(user, customer.id);

    //         console.log("USER CHARGED!");
    //         console.log(charge);

    //         res.json({ orderid: order.orderid });

    //     }
    //     // if error when charging
    //     , function(error) {
    //         // todo: HANDLE THIS!!!!!
    //         console.log("ERROR!");
    //         res.json({ error: error.message });
    //     });
    // }

    //--------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------

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
                // console.log(responseData.body); // outputs "word to your mother."

            }
        });

        res.json({});
    });
    
    app.get('/test500', function(req,res) { res.json(nonExistentVariable); });

    app.get('/manifest.plist', function(req,res) {
        //res.sendfile('./app/views/manifest.plist'); 
        res.sendFile(path.join(__dirname, '../app/views', 'manifest.plist'));
    });
    app.get('/beta.plist', function(req,res) {
        //res.sendfile('./app/views/manifest_beta.plist'); 
        res.sendFile(path.join(__dirname, '../app/views', 'manifest_beta.plist'));
    });

    app.get('/download-app', function(req,res) { 
        //res.sendFile('./app/views/download-app.html'); 
        res.sendFile(path.join(__dirname, '../app/views', 'download-app.hyml'));
    });
    app.get('/app', function(req,res) { 
        //res.sendFile('./app/views/download-app.html'); 
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

        console.log("ACCEPT HEADERS: " + req.headers.accept);
        //console.log("IS AJAX: " + req.xhr ); // <-- why is this always false?
        //res.sendFile(path.join(__dirname, '../app/views', 'main.html'));
        res.sendFile(path.join(__dirname, '../app/views', 'main.html'));
    });
};