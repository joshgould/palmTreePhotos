$(document).ready(function(){  
	$avg = $('#avg');
	$ratings = $('#ratings');
	$movie = $('#movie');
	$stars = $('#stars');
	$comment = $('#comment');
	$button = $('#button');
	$uniques = null;
	
	function displayAll() {
		Parse.Cloud.run('getRatings', {}, {
			success: function(ratings) {
				for (var i=0; i<ratings.length; ++i) {
				  $ratings.append("<p>" + ratings[i].get("movie") + ": " + ratings[i].get("stars") + " stars</p>");
		        }			
			},
			error: function(error) {
				console.log("error " + error);
			}
		});
		displayAvg();
	}
	
	
	function getUniques() {
		Parse.Cloud.run('getUniques', {}, {
			success: function(uniques) {
				$uniques = uniques;
			},
			error: function(error) {
			}
		});
	}
	
	
	function displayAvg() {
		var movies = getUniques();
		console.log("Uniques: " +  $uniques);		
		Parse.Cloud.run('averageStars', { movie: 'The Matrix' }, {
			success: function(ratings) {
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
		}
	
  	$button.click(function() {
    	setReview();
		displayAll();
  	});
		


	// Initialize Parse with your Parse application javascript keys
	Parse.initialize("KRoz8apqdtFgWLkOib5EbxOfvPPKYKaqIKzKQMrZ",
                 "3JwT0X10HBPR525oMMGKzoUcF3VecebpFoiSyGyw");

	displayAll();

	
});
