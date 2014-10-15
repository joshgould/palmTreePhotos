// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $res = null;
var $jpgUrl = null
 

// takes some text and extracts an image url 
function strip(text) {
    var photoUrl = null;
    var geturl = new RegExp("https?:\/\/s3.amazonaws.com\/files.parsetfss.com\/([a-z0-9]|-|\/)+.jpg","g");
    if (text) {
    	photoUrl = text.match(geturl);
    }
    return text.match(geturl);
}

// saves the photo  
function savePhoto(myPhoto) {
 //   console.log("@@@savePhoto – photo: " + myPhoto);    
    var Photo = Parse.Object.extend("Photo");
    var photo = new Photo();  
 
	photo.save({
      photoName: myPhoto
    }).then(function(obj) {
	    console.log("@@@savePhoto – saved: " + myPhoto);
	}, function(error) {
	  	 console.log("!!!savePhoto – not saved. Photo: " + myPhoto + ". Error:" + JSON.stringify(error));
	});
}

function cleanUrl(url) {
	return url.replace('%20', '');
}

Parse.Cloud.define("saveUrls", function(request, response) {
  var photoList = [];
  console.log('in saveURls. length is:' + request.params.photoUrls.length);
  	for(var i=0; i<request.params.photoUrls.length; i++) {
		var PhotoUrl = Parse.Object.extend("PhotoUrl");
	  	var photoUrl = new PhotoUrl();
	  	photoUrl.set("url", cleanUrl(request.params.photoUrls[i]));
	  	photoList[i]=photoUrl;
	}	
    
	Parse.Object.saveAll(photoList,{
    success: function(list) {
      // All the objects were saved.
      response.success("ok");
    },
    error: function(error) {
      // An error occurred while saving one of the objects.
      response.error("failure on saving list " + JSON.stringify(error));
    },
	});	
});
	
	
	// promise = promise.then(function() {
// 	 	return Parse.Cloud.httpRequest({
//         	url:photoUrl,
//  			}).then(function(httpResponse) {
//         		savePhoto(strip(httpResponse.text));
// 				console.log("dunzo");
//         	},
//         	function(error) {
//             	console.log("error");
//         	});
//     	});
//    }
//
// 	return promise;
// });
//
 
Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");
  
// Middleware for reading request body  
app.use(express.bodyParser());    

//Listen for incoming posts and strip out and save the photo urls
app.post('/test', function(req, res) {
    res.send(req.body.TextBody);
    var textBody = req.body.TextBody;
    var photoUrls = null;
	var photoUrl = new RegExp("((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
    if (textBody && (photoUrls = textBody.match(photoUrl))) {
		console.log("@@@Main: Found " + photoUrls.length + " photo Urls: " + photoUrls);		
	    
		//Extract the photos from the urls
		Parse.Cloud.run('saveUrls', {photoUrls:photoUrls}, {
	        success: function(response) {
	            console.log("saveUrls response:"  + response);
	        },
	        error: function(error) {
	            console.log("saveUrls error: " + error);
	        }
	    });
	}	
});

//Attach the Express app to Cloud Code.
app.listen();





