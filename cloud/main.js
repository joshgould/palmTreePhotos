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
		console.log("success results: " + results.length)
	  response.success(results);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});

