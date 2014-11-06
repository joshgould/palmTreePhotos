require('cloud/app.js');

Parse.Cloud.define("getAllPhotos", function(request, response) {
  	var query = new Parse.Query("Photo");
	query.select("photoName,photoDate");
	query.find({
    success: function(results) {
		response.success(results);
    },
    error: function() {
      response.error("photo lookup failed");
    }
  });
});





