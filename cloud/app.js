// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $textBody = "";

Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");

app.use(express.bodyParser());    // Middleware for reading request body
app.post('/test', function(req, res) {
   res.send(req.body.TextBody);
   $textBody = req.body.TextBody;
   console.log('TextBody: ' + req.body.TextBody);	
   var geturl = new RegExp(
	  	"<((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-])>)"
		,"g"
       );
	var length = $textBody.match(geturl).length;
	console.log('length: ' + length);	

	var urls = $textBody.match(geturl); 
	console.log('urls: ' + urls);	
   saveInfo();
});
	

function saveInfo() {
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
