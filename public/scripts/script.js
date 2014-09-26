$(document).ready(function(){  
	$avg = $('#avg');
	$ratings = $('#ratings');
	$movie = $('#movie');
	$stars = $('#stars');
	$comment = $('#comment');
	$button = $('#button');
	
	
	function displayAll() {
		console.log("in display all")
		
		Parse.Cloud.run('getRatings', {
			success: function(ratings) {
				console.log("length: " + ratings.length);
		        for (var i=0; i<ratings.length; ++i) {
				console.log("movie " + i + ": " + ratings.get("movie").val());
		
				  $ratings.append(" <p>Movie: "+ ratings.get("movie").val() + "</p>");
		        }
				
			},
			error: function(error) {
		
				console.log("error " + error);
		
			
			}
		});
	}
	
	
	function displayAvg() {
		Parse.Cloud.run('averageStars', { movie: 'The Matrix' }, {
			success: function(ratings) {
				//alert('ratings is' + ratings);
				$avg.append(" <p>Average is now: "+ ratings + "</p>");
				
			},
			error: function(error) {
			}
		});
	}
	
	function setReview() {
		var Review = Parse.Object.extend("Review");
		var review = new Review();
		
		review.save({
		  movie: $movie.val(),
		  stars: Number($stars.val()),
		  comment: $comment.val()
		}, {
		  		success: function(review) {
		    		console.log("saved!!");
				},
		  		error: function(review, error) {
		 			console.log("error not saved");
				}
			});
		displayAvg();
		}
	
  	$button.click(function() {
    	setReview();
  	});
		


	// Initialize Parse with your Parse application javascript keys
	Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
                 "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");

	displayAll();

	
});
