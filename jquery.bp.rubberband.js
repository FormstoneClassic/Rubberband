/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum
 * @version 1.4.4
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {
	
	// Default options
	var options = {
		addClasses: false,
		breakpoints: {
			horizontal: [1240, 980, 740, 500, 340],
			vertical: []
		},
		debounce: 5
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
		options.breakpoints.horizontal.push(Infinity);
		options.breakpoints.horizontal.sort(_sort);
		
		// Add tallest point
		options.breakpoints.vertical.push(Infinity);
		options.breakpoints.vertical.sort(_sort);
		
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
		
		var dataExit = {},
			dataEnter = {};
		
		// Loop through breakpoints - Horizontal
		for (var point in options.breakpoints.horizontal) {
			point = parseInt(point, 10);
			
			// Add classes to body - psuedo breakpoints for IE
			if (options.breakpoints.horizontal[point + 1] && options.addClasses) {
				if (width <= options.breakpoints.horizontal[point] && width >= options.breakpoints.horizontal[point + 1]) {
					$("body").addClass("bp-min-width-" + options.breakpoints.horizontal[point + 1] + "-max-width-" + options.breakpoints.horizontal[point]);
				} else {
					$("body").removeClass("bp-min-width-" + options.breakpoints.horizontal[point + 1] + "-max-width-" + options.breakpoints.horizontal[point]);
				}
			}
			
			// Check if we"re in a new breakpoint
			if (width <= options.breakpoints.horizontal[point] && (width > options.breakpoints.horizontal[point + 1] || typeof options.breakpoints.horizontal[point + 1] === "undefined") && lastPointHorizontal.max !== options.breakpoints.horizontal[point]) {
				// Add classes to body - psuedo breakpoints for IE
				if (options.addClasses && (!$("body").hasClass("bp-max-width-" + options.breakpoints.horizontal[point]))) {
					$("body").addClass("bp-max-width-" + options.breakpoints.horizontal[point])
							 .addClass("bp-min-width-" + options.breakpoints.horizontal[point + 1])
							 .removeClass("bp-max-width-" + lastPointHorizontal.max)
							 .removeClass("bp-min-width-" + lastPointHorizontal.min);
				}
				
				// Fire events!
				if (typeof lastPointHorizontal.max != "undefined") {
					dataExit.horizontal = lastPointHorizontal.max;
				}
				dataEnter.horizontal = options.breakpoints.horizontal[point];
				
				// Update current breakpoint
				lastPointHorizontal.max = options.breakpoints.horizontal[point];
				lastPointHorizontal.min = options.breakpoints.horizontal[point + 1];
			}
		}
		
		// Loop through breakpoints - Vertical
		for (var point in options.breakpoints.vertical) {
			point = parseInt(point, 10);
			
			// Add classes to body - psuedo breakpoints for IE
			if (options.breakpoints.vertical[point + 1] && options.addClasses) {
				if (height <= options.breakpoints.vertical[point] && height >= options.breakpoints.vertical[point + 1]) {
					$("body").addClass("bp-min-height-" + options.breakpoints.vertical[point + 1] + "-max-height-" + options.breakpoints.vertical[point]);
				} else {
					$("body").removeClass("bp-min-height-" + options.breakpoints.vertical[point + 1] + "-max-height-" + options.breakpoints.vertical[point]);
				}
			}
			
			// Check if we"re in a new breakpoint
			if (height <= options.breakpoints.vertical[point] && (height > options.breakpoints.vertical[point + 1] || typeof options.breakpoints.vertical[point + 1] === "undefined") && lastPointVertical.max !== options.breakpoints.vertical[point]) {
				// Add classes to body - psuedo breakpoints for IE
				if (options.addClasses && (!$("body").hasClass("bp-max-height-" + options.breakpoints.vertical[point]))) {
					$("body").addClass("bp-max-height-" + options.breakpoints.vertical[point])
							 .addClass("bp-min-height-" + options.breakpoints.vertical[point + 1])
							 .removeClass("bp-max-height-" + lastPointVertical.max)
							 .removeClass("bp-min-height-" + lastPointVertical.min);
				}
				
				// Fire events!
				if (typeof lastPointVertical.max != "undefined") {
					dataExit.vertical = lastPointVertical.max;
				}
				dataEnter.vertical = options.breakpoints.vertical[point];
				
				// Update current breakpoint
				lastPointVertical.max = options.breakpoints.vertical[point];
				lastPointVertical.min = options.breakpoints.vertical[point + 1];
			}
		}
		
		if (dataEnter.vertical || dataEnter.horizontal) {
			$(window).trigger("rubberband.enter", [ dataEnter ]);
		}
		if (dataExit.vertical || dataExit.horizontal) {
			$(window).trigger("rubberband.exit", [ dataExit ]);
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