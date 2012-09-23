/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum
 * @version 1.4
 *
 * Copyright © 2012 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {
	
	// Default options
	var options = {
		addClasses: false,
		breakpoints: [1240, 980, 740, 500, 340],
		debounce: 5
	};
	
	// Helper vars
	var lastPoint = {};
	var timeout = null;
	
	// Public Methods
	var pub = {};
		
	// Initialize
	function _init(opts) {
		options = jQuery.extend(options, opts);
		
		// Add widest point
		options.breakpoints.push(10000);
		options.breakpoints.sort(_sort);
		
		// Bind events
		$(window).resize(_respond);
		_respond();
	}
	
	// Debounce resize
	function _respond(e) {
		_clearTimeout();
		timeout = setTimeout(function() {
			_doRespond();
		}, options.debounce);
	}
	
	// Handle resize
	function _doRespond() {
		_clearTimeout();
		
		// Normalize window width
		var width = (window.innerWidth) ? window.innerWidth : document.body.clientWidth - 20;
		
		// Loop through breakpoints
		for (var point in options.breakpoints) {
			point = parseInt(point, 10);
			
			// Add classes to body - psuedo breakpoints for IE
			if (options.breakpoints[point + 1] && options.addClasses) {
				if (width <= options.breakpoints[point] && width >= options.breakpoints[point + 1]) {
					$('body').addClass('bp-min-' + options.breakpoints[point + 1] + "-max-" + options.breakpoints[point]);
				} else {
					$('body').removeClass('bp-min-' + options.breakpoints[point + 1] + "-max-" + options.breakpoints[point]);
				}
			}
			
			// Check if we're in a new breakpoint
			if (width <= options.breakpoints[point] && (width > options.breakpoints[point + 1] || typeof options.breakpoints[point + 1] === "undefined") && lastPoint.max !== options.breakpoints[point]) {
				// Add classes to body - psuedo breakpoints for IE
				if (options.addClasses && (!$('body').hasClass('bp-max-' + options.breakpoints[point]))) {
					$('body').addClass('bp-max-' + options.breakpoints[point])
							 .addClass('bp-min-' + options.breakpoints[point + 1])
							 .removeClass('bp-max-' + lastPoint.max)
							 .removeClass('bp-min-' + lastPoint.min);
				}
				
				// Fire events!
				if (typeof lastPoint.max != "undefined") {
					$(window).trigger('rubberband.exit', [ lastPoint.max ]);
				}
				$(window).trigger('rubberband.enter', [ options.breakpoints[point] ]);
				
				// Update current breakpoint
				lastPoint.max = options.breakpoints[point];
				lastPoint.min = options.breakpoints[point + 1];
			}
		}
	}
	
	// Sort array
	function _sort(a, b) { 
		return (b - a); 
	}
	
	// Clear debouncer
	function _clearTimeout() {
		if (timeout != null) {
			clearTimeout(timeout);
			timeout = null;
		}
	}
	
	// Define plugin 
	$.rubberband = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);