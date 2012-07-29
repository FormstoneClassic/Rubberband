/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum <benjaminplum@gmail.com>
 * @version 1.0
 *
 * Copyright © 2012 Ben Plum <ben@benjaminplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

(function($) {
	var settings = {
		breakpoints: [ 1220, 960, 720, 480, 320 ],
		debounceTime: 5
	};
	var lastPoint = {};
	var timeout = null;
	
	var methods = {
		init: function(options) {
			settings = jQuery.extend(settings, options);

			settings.breakpoints.push(10000);
			settings.breakpoints.sort(methods._sort);
			
			$(window).resize(methods._respond);
			methods._respond();
		},
		_respond: function(e) {
			methods._clearTimeout();
			timeout = setTimeout(function() {
				methods._doRespond();
			}, settings.debounceTime);
		},
		_doRespond: function() {
			methods._clearTimeout();
			var width = (window.innerWidth) ? window.innerWidth : document.body.clientWidth - 20;
			for (var point in settings.breakpoints) {
				point = parseInt(point, 10);
				if (settings.breakpoints[point + 1]) {
					if (width <= settings.breakpoints[point] && width >= settings.breakpoints[point + 1]) {
						$('body').addClass('bp-min-' + settings.breakpoints[point + 1] + "-max-" + settings.breakpoints[point]);
					} else {
						$('body').removeClass('bp-min-' + settings.breakpoints[point + 1] + "-max-" + settings.breakpoints[point]);
					}
				}
				if (width <= settings.breakpoints[point] && (width > settings.breakpoints[point + 1] || typeof settings.breakpoints[point + 1] === "undefined")) {
					if (!$('body').hasClass('bp-max-' + settings.breakpoints[point])) {
						$('body').addClass('bp-max-' + settings.breakpoints[point]).addClass('bp-min-' + settings.breakpoints[point + 1]);
						$('body').removeClass('bp-max-' + lastPoint.max).removeClass('bp-min-' + lastPoint.min);
						
						$(window).trigger('rubberband.exit', [ lastPoint.max ]);
						$(window).trigger('rubberband.enter', [ settings.breakpoints[point] ]);
						
						lastPoint.max = settings.breakpoints[point];
						lastPoint.min = settings.breakpoints[point + 1];
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