/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum
 * @version 1.5.0
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {
	
	// Default options
	var options = {
		debounce: 5,
		horizontal: [1240, 980, 740, 500, 340],
		vertical: []
	};
	
	// Helper vars
	var lastPointVertical = {},
		lastPointHorizontal = {},
		timeout = null;
	
	// Public Methods
	var pub = {};
		
	// Initialize
	function _init(opts) {
		options = jQuery.extend(options, opts);
		
		// Add widest point
		options.horizontal.push(Infinity);
		options.horizontal.sort(_sort);
		
		// Add tallest point
		options.vertical.push(Infinity);
		options.vertical.sort(_sort);
		
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
		
		// Normalize window width & height
		var width = (window.innerWidth) ? window.innerWidth : document.body.clientWidth - 20,
			height = (window.innerHeight) ? window.innerHeight : document.body.clientHeight - 20;
		
		var eventEnter = {},
			eventExit = {};
		
		// Loop through breakpoints - Horizontal
		for (var point in options.horizontal) {
			point = parseInt(point, 10);
			
			// Check if we"re in a new breakpoint
			if (width <= options.horizontal[point] && (width > options.horizontal[point + 1] || 
				typeof options.horizontal[point + 1] === "undefined") && lastPointHorizontal.max !== options.horizontal[point]) {
				// Fire events!
				if (typeof lastPointHorizontal.max != "undefined") {
					eventExit.horizontal = lastPointHorizontal.max;
				}
				eventEnter.horizontal = options.horizontal[point];
				
				// Update current breakpoint
				lastPointHorizontal.max = options.horizontal[point];
				lastPointHorizontal.min = options.horizontal[point + 1];
			}
		}
		
		// Loop through breakpoints - Vertical
		for (var point in options.vertical) {
			point = parseInt(point, 10);
			
			// Check if we"re in a new breakpoint
			if (height <= options.vertical[point] && (height > options.vertical[point + 1] || 
				typeof options.vertical[point + 1] === "undefined") && lastPointVertical.max !== options.vertical[point]) {
				// Fire events!
				if (typeof lastPointVertical.max != "undefined") {
					eventExit.vertical = lastPointVertical.max;
				}
				eventEnter.vertical = options.vertical[point];
				
				// Update current breakpoint
				lastPointVertical.max = options.vertical[point];
				lastPointVertical.min = options.vertical[point + 1];
			}
		}
		
		if (eventEnter.vertical || eventEnter.horizontal) {
			$(window).trigger("rubberband.enter", [ eventEnter ]);
		}
		if (eventExit.vertical || eventExit.horizontal) {
			$(window).trigger("rubberband.exit", [ eventExit ]);
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
		} else if (typeof method === "object" || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);