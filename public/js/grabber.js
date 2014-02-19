/**
 * BadgeGrabber v0.2 | MIT
 * Author: James Mullaney
 */

var BadgeGrabber =  ( typeof BadgeGrabber === 'undefined' ) ? {} : BadgeGrabber;

/**
 * badgeGetter - retrieves the OpenBadge JSON assertion for a badge
 * @param  {jquery Object}   	$selector 					The jquery selector to find assertions in
 * @param  {string}						assertionAttribute 	The attribute name containing the assertion (e.g. data-url, href, rel)
 * @param  {Function} 				callback           	The function to call for every assertion collected
 *                                            returns: 
 *                                            data - the badge assertion
 *                                            url - the assertion url
 *                                            $element - the original jquery Object the assertion was taken from
 * @param  {Function}   			finishCallback     	A function called when all assertions have been collected
 *                                            returns: 
 *                                            errors - an array of arrays containing the  failed assertion URL and the browser error
 */
BadgeGrabber.grab = function( $selector, assertionAttribute, callback, finishCallback ){
	var handled = 0, 
			errors = [];
	$selector.each( function(){
		var $el = $(this);
		
		if( typeof $el.attr(assertionAttribute) !== 'undefined' ){
			var assertion_url = $el.attr(assertionAttribute);

			$.getJSON( assertion_url, function(data){
				callback(data, assertion_url, $el);

				handled++;
				if( handled == $selector.length ){
					finishCallback(errors);
				}
			}).error( function(e){
				handled++;
				errors.push( [assertion_url,e] );
			});

		} else {
			handled++;
		}								
	});
};