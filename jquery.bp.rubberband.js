/*
 * Rubberband - Responsive breakpoint events
 * @author Ben Plum
 * @version 2.0.8
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {

	// Default options
	var supported = (window.matchMedia !== undefined);
		options = {
			debounce: 5,
			minWidth: [0],
			maxWidth: [Infinity],
			minHeight: [0],
			maxHeight: [Infinity],
			unit: "px"
		};
	
	// Helper vars
	var mqMatches = {},
		mqStrings = {
			minWidth: "min-width",
			maxWidth: "max-width",
			minHeight: "min-height",
			maxHeight: "max-height"
		},
		timeout = null,
		currentState = undefined,
		deferred = new $.Deferred();
	
	// Public Methods
	var pub = {
		ready: function() {
			return deferred.promise();
		},
		state: function () {
			return currentState;
		}
	};
	
	// Initialize
	function _init(opts) {
		opts = opts || {};
		// Extend!
		for (var i in mqStrings) {
			options[i] = (opts[i]) ? $.merge(opts[i], options[i]) : options[i];
		}
		options = $.extend(options, opts);

		options.minWidth.sort(_sortD);
		options.maxWidth.sort(_sortA);
		options.minHeight.sort(_sortD);
		options.maxHeight.sort(_sortA);

		// Bind events to specific media query events
		for (var i in mqStrings) {
			mqMatches[i] = {};
			for (var j in options[i]) {
				var _mq = window.matchMedia( "(" + mqStrings[i] + ": " + (options[i][j] == Infinity ? 100000 : options[i][j]) + options.unit + ")" );
				_mq.addListener(_respond);
				mqMatches[i][ options[i][j] ] = _mq;
			}
		}

		// Fire initial event
		_respond();
	}
	
	function _respond() {
		_clearTimeout();
		timeout = setTimeout(function() {
			_doRespond()
		}, options.debouce);
	}
	
	function _doRespond() {
		_setState();
		$(window).trigger("snap", [ currentState ]);
		deferred.resolve();
	}
	
	function _setState() {
		currentState = {};
		for (var i in mqStrings) {
			for (var j in mqMatches[i]) {
				if (mqMatches[i][j].matches) {
					var state = (j == "Infinity" ? Infinity : parseInt(j, 10));
					if (i.indexOf("max") > -1) {
						if (!currentState[i] || state < currentState[i]) {
							currentState[i] = state;
						}
					} else {
						if (!currentState[i] || state > currentState[i]) {
							currentState[i] = state;
						}
					}
				}
			}
		}
		return currentState;
	}
	
	// Sort arrays
	function _sortA(a, b) {
		return (b - a);
	}
	function _sortD(a, b) {
		return (a - b);
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
		// Check for matchMedia() support
		if (supported) {
			if (pub[method]) {
				return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === "object" || !method) {
				return _init.apply(this, arguments);
			}
		}
		return this;
	};
})(jQuery);