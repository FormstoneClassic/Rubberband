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
		},
		bindings = {};
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
		 * @name bind
		 * @description Binds callbacks to media query matching
		 * @param media [string] "Media query to match"
		 * @param data [object] "Object containing 'enter' and 'leave' callbacks"
		 * @example $.rubberband("bind", "(min-width: 500px)", { ... });
		 */
		bind: function(media, data) {
			var mql = {
					mq: window.matchMedia(media),
					active: false,
					enter: [],
					leave: []
				},
				key = createKey(mql.mq.media);

			if (!bindings[ key ]) {
				bindings[ key ] = mql;
				bindings[ key ].mq.addListener(_onBindingRespond);
			}

			for (var i in data) {
				if (data.hasOwnProperty(i) && bindings[ key ].hasOwnProperty(i)) {
					bindings[ key ][i].push(data[i]);
				}
			}

			_onBindingRespond(bindings[ key ].mq);

			return this;
		},

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.rubberband("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
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
		},

		/**
		 * @method
		 * @name unbind
		 * @description Unbinds all callbacks from media query
		 * @param media [string] "Media query to match"
		 * @example $.rubberband("unbind", "(min-width: 500px)", { ... });
		 */
		unbind: function(media) {
			var key = createKey(media);

			if (bindings[ key ]) {
				bindings[ key ].mq.removeListener(_onBindingRespond);
				bindings = bindings.splice(bindings.indexOf(bindings[ key ]), 1);
			}

			return this;
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
		currentState = {
			unit: options.unit
		};

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
	 * @name _onBindingRespond
	 * @description Handles a binding's media query change
	 */
	function _onBindingRespond(mq) {
		var key = createKey(mq.media),
			binding = bindings[ key ],
			event = mq.matches ? "enter" : "leave";

		if (binding && (binding.active || (!binding.active && mq.matches))) {
			for (var i in binding[event]) {
				if (binding[event].hasOwnProperty(i)) {
					binding[event][i].apply(binding.mq);
				}
			}

			binding.active = true;
		}
	}

	function createKey(string) {
		return string.replace(/\(/g, '').replace(/\)/g, '').replace(/\:/g, '').replace(/\s+/g, '-');
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