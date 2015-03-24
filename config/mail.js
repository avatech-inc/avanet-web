var Mandrill = require('mandrill-api/mandrill');
var MandrillClient = new Mandrill.Mandrill('7rf_S2fspOqZA31H6_0IXA');

exports.sendTemplate = function(templateName, to, vars) {

	// translate object into key/val array
	var _vars = [];
	for (_var in vars) {
		_vars.push({ name: _var, content: vars[_var]});
	}

	// send via Mandrill
    MandrillClient.messages.sendTemplate({
        template_name: templateName,
        template_content: [], async: false, ip_pool: 'Main Pool',
        message: {
            to: [to],
            merge_vars: [{
                rcpt: to.email,
                vars: _vars
            }]
        }
    }, function(error){
        if(error){ console.log(error);}
    });
    
};

exports.sendMessage = function(message, subject, to) {

    MandrillClient.messages.send({
        message: {
            "html": message,
            subject: subject,
            "from_email": "hello@avatech.com",
            "from_name": "AvaTech",
            to: [to]
        }
    }, function(error){
        if(error){ console.log(error);}
    });
}