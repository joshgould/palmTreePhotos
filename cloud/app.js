// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var photoDate = null;

// takes some text and extracts an image url 
function strip(text) {
    var photoUrl = null;
    var geturl = new RegExp("https?:\/\/s3.amazonaws.com\/files.parsetfss.com\/([a-z0-9]|-|\/)+.jpg","g");
    if (text) {
    	photoUrl = text.match(geturl);
    }
    return text.match(geturl);
}

function cleanUrl(url) {
	return url.replace('%20', '');
}

Parse.Cloud.define("serialRequests", function(request, response) {
  var photoObj = request.params.photos;
  var photoUrls = photoObj.photoUrls;
  var photoDate = photoObj.date;
  var promises = [];
  var photos = [];
  for (var i=0; i < photoUrls.length; i++) {
  	var myPhotoUrl = cleanUrl(photoUrls[i]); 
		promises.push(	
			Parse.Cloud.httpRequest({
 	        	url:myPhotoUrl,
 	        }).then(function(httpResponse) {			
				 var stripped = strip(httpResponse.text);
				 var Photo = Parse.Object.extend("Photo");
			     var photo = new Photo();  
				 photo.set("photoDate", photoDate)
 				 photo.set("photoName", stripped);
				 photos.push(photo);
			})
		);
	}	
	Parse.Promise.when(promises).then(function() {	
		var objectsToSave = [];
		var result = true;
		for (var i=photos.length-1; i >= 0; i--) {
		    objectsToSave.push(photos[i]); 
		    if (i % 10 == 0) {
		        result = saveObjects(objectsToSave);
		        objectsToSave.length = 0;
		    }
		};
		if (result == true) {
		    console.log("saveInBackground success");
		}
	}).then(function() {
		response.success("serialRequests complete");
	});
	}, function(err) {
	console.log('@@@serialRequests - parse promises error:' +  JSON.stringify(error));
	response.error();
});  

function saveObjects(photos) {
 // 	console.log('@@@saveObjects - in saveObjects');
	Parse.Object.saveAll(photos, {
    success: function(list) {
      // All the objects were saved.
      response.success("save all ok");
    },
    error: function(error) {
      // An error occurred while saving one of the objects.
	  console.log('@@@saveObject - savall error:' + error);
	  response.error("failure on saving list " + JSON.stringify(error));
    },
	}).then(function(){
		console.log("saveAll success");		
	});
}

function getPhotoList(textBody) {
	var photoUrl = new RegExp("((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
	var dateStr = new RegExp("(Date:\\s[A-Z]\\w+,\\s[A-Z]\\w+\\s[0-9]+,\\s[0-9]+)","i");
	var photoObj = {
		date:null,
		photoUrls:null
	};
	
	if (textBody == null) {
		console.log("@@@getPhotoList: textBody is null.");
	} else {
		photoObj.photoUrls = textBody.match(photoUrl);
		photoObj.date = textBody.match(dateStr);

		if (photoObj.date != null) {
			photoObj.date = photoObj.date[0].substring(6);
		}
		
		if (photoObj.photoUrls == null) {
			console.log("@@@getPhotoList: no photos found.");
		} else {
			console.log("@@@getPhotoList: Found " + photoObj.photoUrls.length + " photo Urls: " + photoObj.photoUrls + " date:" + photoObj.date);
		}
	}
	return photoObj;
}

function getPhotos(textBody) {
 	var photos = getPhotoList(textBody);
	if (photos == null) {
		return;
	}
	//Extract the photos from the urls
	  return Parse.Cloud.run('serialRequests', {photos:photos}, {
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
	Parse.Promise.when([promise]).then(function() { 
		status.success(); 
	});	
	res.send(req.body.TextBody);
});
		
//Attach the Express app to Cloud Code.
app.listen();

