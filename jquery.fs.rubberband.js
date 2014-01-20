/* 
 * Rubberband v3.0.2 - 2014-01-20 
 * A jQuery plugin for responsive media query events. Part of the Formstone Library. 
 * http://formstone.it/rubberband/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";
	
	var nativeSupport = (window.matchMedia !== undefined),
		currentState = null,
		mqMatches = {},
		mqStrings = {
			minWidth: "min-width",
			maxWidth: "max-width",
			minHeight: "min-height",
			maxHeight: "max-height"
		};
		//deferred = new $.Deferred();
	
	/**
	 * @options
	 * @param minWidth [array] <[ 0 ]> "Array of min-widths"
	 * @param maxWidth [array] <[ Infinity ]> "Array of max-widths"
	 * @param minHeight [array] <[ 0 ]> "Array of min-heights"
	 * @param maxHeight [array] <[ Infinity ]> "Array of max-heights"
	 * @param unit [string] <'px'> "Unit to use when matching widths and heights"
	 */
	var options = {
			//mediaQueries: [],  * @param mediaQueries [array] <[]> "Array of custom media queries to match against"
			minWidth: [0],
			maxWidth: [Infinity],
			minHeight: [0],
			maxHeight: [Infinity],
			unit: "px"
		};
	
	
	var pub = {
		
		/**
		 * @method 
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.rubberband("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		/*
		ready: function() {
			return deferred.promise();
		},
		*/
		
		/**
		 * @method 
		 * @name state
		 * @description Returns the current state
		 * @return [object] "Current state object"
		 * @example var state = $.rubberband("state");
		 */
		state: function () {
			return currentState;
		}
	};
	
	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		opts = opts || {};
		
		for (var i in mqStrings) {
			if (mqStrings.hasOwnProperty(i)) {
				options[i] = (opts[i]) ? $.merge(opts[i], options[i]) : options[i];
			}
		}
		options = $.extend(options, opts);
		
		// Do some sorting
		options.minWidth.sort(_sortDesc);
		options.maxWidth.sort(_sortAsc);
		options.minHeight.sort(_sortDesc);
		options.maxHeight.sort(_sortAsc);
		
		// Bind events to specific media query events
		for (var j in mqStrings) {
			if (mqStrings.hasOwnProperty(j)) {
				mqMatches[j] = {};
				for (var k in options[j]) {
					if (options[j].hasOwnProperty(k)) {
						var _mq = window.matchMedia( "(" + mqStrings[j] + ": " + (options[j][k] === Infinity ? 100000 : options[j][k]) + options.unit + ")" );
						_mq.addListener(_onRespond);
						mqMatches[j][ options[j][k] ] = _mq;
					}
				}
			}
		}
		
		// Fire initial event
		_onRespond();
	}
	
	/**
	 * @method private
	 * @name _onRespond
	 * @description Handles media query changes
	 */ 
	function _onRespond() {
		_setState();
		$(window).trigger("snap", [ currentState ]);
		//deferred.resolve();
	}
	
	/**
	 * @method private
	 * @name _setState
	 * @description Sets current media query match state
	 */ 
	function _setState() {
		currentState = {};
		for (var i in mqStrings) {
			if (mqStrings.hasOwnProperty(i)) {
				for (var j in mqMatches[i]) {
					if (mqMatches[i].hasOwnProperty(j)) {
						if (mqMatches[i][j].matches) {
							var state = (j === "Infinity" ? Infinity : parseInt(j, 10));
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
			}
		}
	}
	
	/**
	 * @method private
	 * @name _sortAsc
	 * @description Sorts an array (ascending)
	 * @param a [mixed] "First value"
	 * @param b [mixed] "Second value"
	 * @return Difference between second and first values
	 */ 
	function _sortAsc(a, b) {
		return (b - a);
	}
	
	/**
	 * @method private
	 * @name _sortDesc
	 * @description Sorts an array (descending)
	 * @param a [mixed] "First value"
	 * @param b [mixed] "Second value"
	 * @return Difference between first and second values
	 */ 
	function _sortDesc(a, b) {
		return (a - b);
	}
	
	$.rubberband = function(method) {
		if (nativeSupport) {
			if (pub[method]) {
				return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof method === "object" || !method) {
				return _init.apply(this, arguments);
			}
		}
		return this;
	};
})(jQuery, window);