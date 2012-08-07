/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum
 * @version 1.2
 *
 * Copyright © 2012 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

(function($) {
	
	// Default options
	var options = {
		addClasses: false,
		breakpoints: [1240, 980, 740, 500, 340],
		debounce: 5
	};
	
	// Helper vars
	var lastPoint = {};
	var timeout = null;
	
	// Methods
	var methods = {
		
		// Initialize
		init: function(opts) {
			options = jQuery.extend(options, opts);
			
			// Add widest point
			options.breakpoints.push(10000);
			options.breakpoints.sort(methods._sort);
			
			// Bind events
			$(window).resize(methods._respond);
			methods._respond();
		},
		
		// Debounce resize
		_respond: function(e) {
			methods._clearTimeout();
			timeout = setTimeout(function() {
				methods._doRespond();
			}, options.debounce);
		},
		
		// Handle resize
		_doRespond: function() {
			methods._clearTimeout();
			
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
					$(window).trigger('rubberband.exit', [ lastPoint.max ]);
					$(window).trigger('rubberband.enter', [ options.breakpoints[point] ]);
					
					// Update current breakpoint
					lastPoint.max = options.breakpoints[point];
					lastPoint.min = options.breakpoints[point + 1];
				}
			}
		},
		
		// Sort array
		_sort: function(a, b) { 
			return (b - a); 
		},
		
		// Clear debouncer
		_clearTimeout: function() {
			if (timeout != null) {
				clearTimeout(timeout);
				timeout = null;
			}
		}
	};
	
	// Define plugin 
	$.rubberband = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("RUBBERBAND: '" +  method + "' does not exist.");
		} 
	};
})(jQuery);