// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $res = null;
var $jpgUrl = null
 

// takes some text and extracts an image url 
function strip(text) {
    console.log("@@@strip – text" + text);    
   
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

Parse.Cloud.define("httpRequest", function(request, response) { 
var webpage = "Something went wrong.";
Parse.Cloud.httpRequest({
        url: request.params.photoUrl,
        success: function (httpResponse) {    
        webpage = httpResponse.text;
        webpage = webpage.toString();
        response.success(webpage);
    },
    error: function (error)
    {
        console.log("Error in http request " + error.message);
        response.error(error.message);
    }
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
	    var promises = [];
		
		for (var i=0; i < photoUrls.length; i++) {
		    var myPhotoUrl = photoUrls[i];		
		    console.log("@@@ MAIN – photoUrl:" + i + ": " +myPhotoUrl);		
			promises.push( Parse.Cloud.run('httpRequest', {photoUrl:myPhotoUrl}, {
		            success: function(httpResponse) {
		                console.log("*** httpResponse is"  + httpResponse);
						var photo = strip(httpResponse.text); 
						console.log("@@@httpRequests – saving photo: " + photo + ". Stripped from photoUrl:" + i + ": " + photoUrl);
						savePhoto(photo);
		            },
		            error: function(error) {
		                    console.log("*** error " + error.message);
							status.error(error.message);
		            }
		        })
			);
		}
		Parse.Promise.when(promises).then(function() {
		   console.log("*** ALL DONE");
		}, function(err) {
		   console.log("**** ERROR");
		});

    } else {
        console.log("@@@Main: Found no photo Urls.");
    }
});

//Attach the Express app to Cloud Code.
app.listen();