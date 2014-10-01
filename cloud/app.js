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
    console.log("@@@savePhoto – photo: " + myPhoto);    
    var Photo = Parse.Object.extend("Photo");
    var photo = new Photo();  
 
    photo.save({
      photoName: myPhoto
    }, {
            success: function(photo) {
                console.log("@@@savePhoto – saved: " + myPhoto);
            },
            error: function(photo, error) {
                console.log("!!!savePhoto – not saved. Photo: " + myPhoto + ". Error:" + JSON.stringify(error));
            }
        });
}

Parse.Cloud.define("serialRequests", function(request, response) {
  var photoUrls = request.params.photoUrls;
  var promise = Parse.Promise.as();
  var count = 0;
 
 console.log("@@@serialRequests – photoUrls: " + photoUrls);
  
 // for each Photo Url, get the content and extract the photo 
 for (var i=0; i < photoUrls.length; i++) {
    var photoUrl = photoUrls[i];
    console.log("@@@serialRequests – photoUrl:" + i + ": " + photoUrl);

	// not sure what this does... 
    promise = promise.always(function() {
      return Parse.Cloud.httpRequest({
        url: photoUrl,
        success: function(httpResponse) {
          count++;
		  
		  // take the httpresponse text, strip out the photo url and save it
          var photo = strip(httpResponse.text); 
          console.log("@@@serialRequests – saving photo: " + photo + ". Stripped from photoUrl:" + i + ": " + photoUrl);
		  savePhoto(photo);
        },
        error: function(httpResponse) {
          console.log("!!!serialRequests error – photoUrl # " + i + " status: " + httpResponse.status);
          count++;
        }
      });
    });
  }
 
  promise.always(function() {
    console.log("@@@serialRequests – count: " + count);
    return response.success();
  });
});
 

 
Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");
  
// Middleware for reading request body  
app.use(express.bodyParser());    

//Listen for incoming posts and strip out photo urls
app.post('/test', function(req, res) {
    res.send(req.body.TextBody);
    var textBody = req.body.TextBody;
    var photoUrls = null;
	var photoUrl = new RegExp("((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
    if (textBody && (photoUrls = textBody.match(photoUrl))) {
		console.log("@@@Main: Found " + photoUrls.length + " photo Urls: " + photoUrls);		
	    
		//Extract the photos from the urls
		Parse.Cloud.run('serialRequests', {photoUrls:photoUrls}, {
	        success: function(res) {
	            console.log("getphotos res is"  + res);
	        },
	        error: function(error) {
	            console.log("getPhotos error " + error);
	        }
	    })
		
		
    } else {
        console.log("@@@Main: Found no photo Urls.");
    }
});

//Attach the Express app to Cloud Code.
app.listen();