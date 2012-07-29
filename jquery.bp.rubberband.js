/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum <benjaminplum@gmail.com>
 * @version 1.0.1
 *
 * Copyright © 2012 Ben Plum <ben@benjaminplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

(function($) {
	var options = {
		breakpoints: [ 1220, 960, 720, 480, 320 ],
		debounceTime: 5,
		addClasses: false
	};
	var lastPoint = {};
	var timeout = null;
	
	var methods = {
		init: function(opts) {
			options = jQuery.extend(options, opts);
			
			options.breakpoints.push(10000);
			options.breakpoints.sort(methods._sort);
			
			$(window).resize(methods._respond);
			methods._respond();
		},
		_respond: function(e) {
			methods._clearTimeout();
			timeout = setTimeout(function() {
				methods._doRespond();
			}, options.debounceTime);
		},
		_doRespond: function() {
			methods._clearTimeout();
			var width = (window.innerWidth) ? window.innerWidth : document.body.clientWidth - 20;
			for (var point in options.breakpoints) {
				point = parseInt(point, 10);
				if (options.breakpoints[point + 1] && options.addClasses) {
					if (width <= options.breakpoints[point] && width >= options.breakpoints[point + 1]) {
						$('body').addClass('bp-min-' + options.breakpoints[point + 1] + "-max-" + options.breakpoints[point]);
					} else {
						$('body').removeClass('bp-min-' + options.breakpoints[point + 1] + "-max-" + options.breakpoints[point]);
					}
				}
				if (width <= options.breakpoints[point] && (width > options.breakpoints[point + 1] || typeof options.breakpoints[point + 1] === "undefined")) {
					if (!$('body').hasClass('bp-max-' + options.breakpoints[point])) {
						if (options.addClasses) {
							$('body').addClass('bp-max-' + options.breakpoints[point])
									 .addClass('bp-min-' + options.breakpoints[point + 1])
									 .removeClass('bp-max-' + lastPoint.max)
									 .removeClass('bp-min-' + lastPoint.min);
						}
						
						$(window).trigger('rubberband.exit', [ lastPoint.max ]);
						$(window).trigger('rubberband.enter', [ options.breakpoints[point] ]);
						
						lastPoint.max = options.breakpoints[point];
						lastPoint.min = options.breakpoints[point + 1];
					}
				}
			}
		},
		_sort: function(a, b) { 
			return (b - a); 
		},
		_clearTimeout: function() {
			if (timeout != null) {
				clearTimeout(timeout);
				timeout = null;
			}
		}
	};

	$.fn.rubberband = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("RUBBERBAND: '" +  method + "' does not exist.");
		} 
	};
})(jQuery);