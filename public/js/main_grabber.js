//start on ready
$(document).ready( function(){
	//Set the container we will push badges into
	var $badges = $('#badges');
	//Display a loading message while we wait...
	$badges.append('<div class="loading">Loading badges...</div>');

	//Fetch the badges
	BadgeGrabber.grab( 
		$('.assertions .badge-assertion'), //the selector to grab assertions from
		'data-url', //the attribute name holding the assertion
		function( badge, url, $element ){ 
			//The callback will return:
			// -the assertion JSON
			// -the url of the assertion 
			// -the $element that it originally came from 
			var $title = $('<h3/>').text( badge.name ).addClass('badge-title'),
					$desc = $('<p/>').text( badge.description ).addClass('badge-desc'),
					$link = $('<a/>').text('Click to view assertion').attr('href', url ).attr('target', '_blank'),
					$image = $('<img/>').attr('src', badge.image);

			var $info = $('<div/>').addClass('badge-info').append($title, $desc, $link);

			var $badgeCont = $('<div class="badge-container"></div>')
												.append($image)
												.append($info);

			$badges.append( $badgeCont );
		}, 
		function( errors ){
			//return an array of arrays containing the assertion URL and browser error
			$badges.find('.loading').remove(); 
		}
	);
});