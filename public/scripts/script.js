$(document).ready(function(){  
	$photos = $('#photos');
	
	function displayAll() {
		Parse.Cloud.run('getAllPhotos', {}, {
			success: function(photos) {
				$photos.empty()
				for (var i=0; i<photos.length; ++i) {
				  $photos.append("<p><img src='" + photos[i].get('photoName') + "'></p>");
		        }			
			},
			error: function(error) {
				console.log("displayAll error " + error);
			}
		});
	}

	// Initialize Parse with your Parse application javascript keys
	 Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
                 "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");

	displayAll();
	
});
