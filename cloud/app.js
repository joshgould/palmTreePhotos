// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var $textBody = "";
var $photoUrls = null;
var $res = null;
var $jpgUrl = null
 
 
Parse.Cloud.define("serialRequests", function(request, response) {
  var urls = request.params.photos;
  var promise = Parse.Promise.as();
  var count = 0;
 
  console.log("In serialRequests ");
  
 for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    console.log("url: " + url);
    promise = promise.always(function() {
      return Parse.Cloud.httpRequest({
        url: url,
        success: function(httpResponse) {
          //console.log("Response: " + httpResponse.text);
          count++;
          savePhoto(strip(httpResponse.text));
        },
        error: function(httpResponse) {
          console.log("Status: " + httpResponse.status);
          count++;
        }
      });
    });
  }
 
  promise.always(function() {
    console.log("Count: " + count);
    return response.success();
  });
});
 
 
function strip(resp) {
    var photoUrl = null;
    console.log("### in strip");
    var geturl = new RegExp("https?:\/\/s3.amazonaws.com\/files.parsetfss.com\/([a-z0-9]|-|\/)+.jpg","g");
    if (resp.match(geturl)) {
        var length = resp.match(geturl).length;
        console.log('photo url length: ' + length);
        photoUrl = resp.match(geturl);
    }
    return photoUrl;
}
  
  
function savePhoto(url) {
    console.log('### saving photo: ' + url);    
    var PhotoUrl = Parse.Object.extend("PhotoUrl");
    var photoUrl = new PhotoUrl();  
 
    photoUrl.save({
      photoUrl: url
    }, {
            success: function(photoUrl) {
                console.log("savePhoto saved:" + photoUrl);
            },
            error: function(photoUrl, error) {
                console.log("savePhoto error not saved" + photoUrl + error);
            }
        });
}
      
 
 
  
function getPhotos(xphotos) {
    console.log("*** in getPhotos. Photos:" + xphotos);
      
    Parse.Cloud.run('serialRequests', {photos:xphotos}, {
        success: function(res) {
            console.log("getphotos res is"  + res);
            //$jpgUrl = res;
        },
        error: function(error) {
            console.log("getPhotos error " + error);
        }
    })
}
  
  
Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
             "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");
  
app.use(express.bodyParser());    // Middleware for reading request body
app.post('/test', function(req, res) {
    res.send(req.body.TextBody);
    $textBody = req.body.TextBody;
    //console.log('TextBody: ' + req.body.TextBody);    
    var geturl = new RegExp("((http|https)://www.kinderlime.com/photos/(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");  
    if ($textBody && $textBody.match(geturl)) {
        var length = $textBody.match(geturl).length;
        console.log('Number of matching URLS: ' + length);  
        $photoUrls = $textBody.match(geturl); 
        console.log('Matching URLS array:' + $photoUrls);   
        saveInfo();
    }   
});
      
  
function saveInfo() {
      
    // var PhotoUrls = Parse.Object.extend("PhotoUrls");
    // var photoUrls = new PhotoUrls();
    // photoUrls.save({
//    photoUrls: $photoUrls
//  }, {
//          success: function(photoUrls) {
//              console.log("savInfo saved:" + photoUrls);
//          },
//          error: function(photoUrls, error) {
//              console.log("saveInfo error not saved" + photoUrls + error);
//          }
//      });
      
        // for each photoURL, get the photo
    // if ($photoUrls) {
        // for(var i=0; i<$photoUrls.length; i++) {
            // getPhoto($photoUrls[i]);
        // }
    // }
    getPhotos($photoUrls);
}
  
  
// Attach the Express app to Cloud Code.
app.listen();