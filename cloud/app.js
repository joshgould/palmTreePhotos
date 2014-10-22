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

function cleanUrl(url) {
	return url.replace('%20', '');
}

Parse.Cloud.define("serialRequests", function(request, response) {
  var photoUrls = request.params.photoUrls;
  console.log("@@@serialRequests – photoUrls: " + photoUrls);
  var promises = [];
  var photos = [];
  // for each Photo Url, get the content and extract the photo
  for (var i=0; i < photoUrls.length; i++) {
  	var myPhotoUrl = cleanUrl(photoUrls[i]); 
	    promises.push(
			Parse.Cloud.httpRequest({
 	        	url:myPhotoUrl,
 	        }).then(function(httpResponse) {			
				 console.log("@@@serialRequests – photoUrl:" + i + ": " + myPhotoUrl);
 	   			 var stripped = strip(httpResponse.text);
			     var Photo = Parse.Object.extend("Photo");
			     var photo = new Photo();  
 				 photo.set("photoName", stripped);
				 photos.push(photo);
			});
		);
        Parse.Object.saveAll(resultsToSave,{
                success: function(list) {
                    console.log("saveAll success:" + photos);
                    status.success("saveAll success");  
                },
                error: function(error) {
                    console.log("saveAll error: " + error.message + error.text + error.data);
         	   }
		   });        
    }
	Parse.Promise.when(promises);
});


function getPhotoList(textBody) {
	var photoURls = null;
	var photoUrl = new RegExp("((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
	if (textBody == null) {
		console.log("@@@checkForPhotos: textBody is null.");
	} else {
		photoUrls = textBody.match(photoUrl);
		if (photoUrls == null) {
			console.log("@@@checkForPhotos: no photos found.");
			return;
		} else {
			console.log("@@@checkForPhotos: Found " + photoUrls.length + " photo Urls: " + photoUrls);
		}
	}
	return photoUrls;
}

function getPhotos(textBody) {
 	var photoUrls = getPhotoList(textBody);
	if (photoUrls == null) {
		return;
	}
	//Extract the photos from the urls
	  return Parse.Cloud.run('serialRequests', {photoUrls:photoUrls}, {
        success: function(res) {
			response.success("###success: " + res);
        },
        error: function(error) {
			response.error("###error: " + error);
        }
    });
}	

Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");
  
// Middleware for reading request body  
app.use(express.bodyParser());    

//Listen for incoming posts and get the photos
app.post('/test', function(req, res) {
    var promise = getPhotos(req.body.TextBody);
	
//	console.log("promise: " + JSON.stringify(promise));
	
	Parse.Promise.when([promise]).then(function() { 
		console.log("%%% promise complete");
		console.log("status success: " + status.success());	
		console.log("status error: " + status.error());	
		status.success(); 
	});
	
	res.send(req.body.TextBody);
});
		
//Attach the Express app to Cloud Code.
app.listen();

