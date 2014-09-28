// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $textBody = "";

Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");

// Global app configuration section
//app.set('views', 'cloud/views');  // Specify the folder to find templates
//app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.post('/test', function(req, res) {
   res.send(req.body.TextBody);
   $textBody = req.body.TextBody;
   console.log('TextBody: ' + req.body.TextBody);	
   saveInfo();
})
	



function saveInfo() {
	console.log("in SaveInfo");	
	var Body = Parse.Object.extend("Body");
	var body = new Body();	
	body.save({
	  body: $textBody
	}, {
	  		success: function(body) {
	    		console.log("savInfo saved:" + body);
			},
	  		error: function(body, error) {
	 			console.log("saveInfo error not saved" + body + error);
			}
		});
	}


// Attach the Express app to Cloud Code.
app.listen();
