// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $textBody = "";
var $photoUrls = null;
var $res = null;
var $jpgUrl = null

Parse.Cloud.define('httpRequest', function(request, response) {
	Parse.Cloud.httpRequest({
    url: request.params.url,
	success: function(httpResponse) {
		console.log("@@request url: " + request.params.url);
		response.success(httpResponse);
	//    console.log("@@ response" + httpResponse.text);
	  },
	  error: function(httpResponse) {
			response.error("httpRequest failed");    
			console.error('Request failed with response code ' + httpResponse.status);
	  }
	});
});

function strip() {
console.log("### in strip");
//	var geturl = new RegExp("https?:\/\/s3.amazonaws.com\/files.parsetfss.com\/([a-z0-9]|-|\/)+.jpg","g");	
//	if (res.match(geturl)) {
//		var length = res.match(geturl).length;
//		console.log('photo url length: ' + length);	
//		$jpgUrl = res.match(geturl); 
//		console.log('jpg urls: ' + $jpgUrl);	
//   		saveInfo();
//	}
	
}


function getPhoto(photoUrl) {
	console.log("*** in getPhoto. URL: " + photoUrl);
	
	Parse.Cloud.run('httpRequest', {url:photoUrl}, {
		success: function(res) {
		 	console.log("getphoto res is"  + res);
			
		},
		error: function(error) {
			console.log("getPhoto error " + error);
		}
	}).then(function() {
				strip();
		});	
}


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
	if ($photoUrls) {
		for(var i=0; i<$photoUrls.length; i++) {
			getPhoto($photoUrls[i]);
		}
	}
}


// Attach the Express app to Cloud Code.
app.listen();
