// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $textBody = "";
var $photoUrls = null;

Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");

app.use(express.bodyParser());    // Middleware for reading request body
app.post('/test', function(req, res) {
   	res.send(req.body.TextBody);
   	$textBody = req.body.TextBody;
   	console.log('TextBody: ' + req.body.TextBody);	
   	var geturl = new RegExp("((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");	
	if ($textBody.match(geturl)) {
		var length = $textBody.match(geturl).length;
		console.log('length: ' + length);	
		$photoUrls = $textBody.match(geturl); 
		console.log('urls: ' + $photoUrls);	
   		saveInfo();
	}	
});
	

function saveInfo() {
	
	var PhotoUrls = Parse.Object.extend("PhotoUrls");
	var photoUrls = new PhotoUrls();	
	photoUrls.save({
	  photoUrls: $photoUrls
	}, {
	  		success: function(photoUrls) {
	    		console.log("savInfo saved:" + photoUrls);
			},
	  		error: function(photoUrls, error) {
	 			console.log("saveInfo error not saved" + photoUrls + error);
			}
		});
	}


// Attach the Express app to Cloud Code.
app.listen();
