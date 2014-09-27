Parse.Cloud.define("averageStars", function(request, response) {
  	var query = new Parse.Query("Review");
  	query.equalTo("movie", request.params.movie);
	query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get("stars");
      }
      response.success(sum / results.length);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});


Parse.Cloud.define("getRatings", function(request, response) {
  	var query = new Parse.Query("Review");
	query.select("movie","stars");
	query.find({
    success: function(results) {
		response.success(results);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});


Parse.Cloud.define("getUniques", function(request, response) {
  	var query = new Parse.Query("Review");
	query.select("movie");
	query.find({
    success: function(results) {
		var uniques = [];
 		for (var i= 0; i<results.length; ++i) {
			var movie = results[i].get("movie");
			if (uniques.indexOf(movie) < 0) { 
				uniques.push(movie);
			}
		}  
	//	console.log(uniques);
		response.success(uniques);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});

var express = require('express');
var app = express();
 
// Global app configuration section
app.use(express.bodyParser());  // Populate req.body
 
app.post('/notify_message',
         express.basicAuth('YOUR_USERNAME', 'YOUR_PASSWORD'),
         function(req, res) {
  // Use Parse JavaScript SDK to create a new message and save it.
  var Message = Parse.Object.extend("Message");
  var message = new Message();
  message.save({ text: req.body.text }).then(function(message) {
    res.send('Success');
  }, function(error) {
    res.status(500);
    res.send('Error');
  });
});
 
app.listen();


