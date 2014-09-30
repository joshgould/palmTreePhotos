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
function savePhoto(photoUrl) {
    console.log("@@@savePhoto – photo: " + photoUrl);    
    var Photo = Parse.Object.extend("Photo");
    var photo = new Photo();  
 
    photo.save({
      photo: photoUrl
    }, {
            success: function(photo) {
                console.log("@@@savePhoto – saved: " + photo);
            },
            error: function(photo, error) {
                console.log("!!!savePhoto – not saved" + error + ". " + photo);
            }
        });
}

Parse.Cloud.define("serialRequests", function(request, response) {
  var urls = request.params.photoUrls;
  var promise = Parse.Promise.as();
  var count = 0;
 
 console.log("@@@serialRequests – photoUrls: " + urls);
  
 // for each Url, get the content and extract the photo 
 for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    console.log("@@@serialRequests – url: " + i + ": " + url);

	// not sure what this does... 
    promise = promise.always(function() {
      return Parse.Cloud.httpRequest({
        url: url,
        success: function(httpResponse) {
          //console.log("Response: " + httpResponse.text);
          count++;
		  
		  // take the httpresponse text, strip out the photo url and save it
          savePhoto(strip(httpResponse.text));
        },
        error: function(httpResponse) {
          console.log("!!!serialRequests error – status: " + httpResponse.status);
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