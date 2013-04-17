/**
 * Represents the module which is used for the generation of the in-browser component of Gaikan. This enables in-browser
 * rendering of templates as each template is cached in this file upon serving. This module relies on the jQuery library
 * to enable AJAX communication and jQuery Form Plugin (http://www.malsup.com/jquery/form).
 */
var Gaikan = (function ($, container) {
	// Initialize gaikan.
	var gaikan = {};
	// Initialize the version.
	var version = '1.0';
	// Check if history is available.
	if ($ && $.fn.ajaxForm && window.history) {
		// Initialize the loading state.
		var isLoading = false;
		// Attach to each anchor element. 
		$(document).delegate('a', 'click', function (ev) {
			// Prevent the default.
			ev.preventDefault();
			// Check the loading state.
			if (!isLoading) {
				// Remember this.
				var self = this;
				// Set the loading state.
				isLoading = true;
				// Start an asynchronous request.
				$.ajax({
					// Occurs before sending.
					beforeSend: function (request) {
						// Set the X-Gaikan-Browser header.
						request.setRequestHeader('X-Gaikan-Browser', version);
					},
					// Occurs upon an error.
					error: function () {
						// Set the location.
						window.location.href = $(self).attr('href');
						// Set the loading state.
						isLoading = false;
					},
					// Occurs upon success.
					success: function (data) {
						// Initialize the response.
						var response = $.parseJSON(data);
						// Initialize the template.
						var html = gaikan.runtime.render(response.root, null, response.file);
						// Set the container template.
						$(container).html(html);
						// Push the state to history.
						window.history.pushState(response, 'Gaikan', $(self).attr('href'));
						// Set the loading state.
						isLoading = false;
					},
					// The request type.
					type: 'GET',
					// The request address.
					url: $(self).attr('href'),
				});
			}
		});
		// Attach to each form element.
		$(document).delegate('form', 'submit', function (ev) {
			// Remember this.
			var self = this;
			// Attach the AJAX form handler.
			$(self).ajaxSubmit({
				// Occurs before submitting.
				beforeSend: function (request) {
					// Set the X-Gaikan-Browser header.
					request.setRequestHeader('X-Gaikan-Browser', version);
					// Return false.
					return false;
				},
				// Occurs upon success.
				success: function (data) {
					// Initialize the response.
					var response = $.parseJSON(data);
					// Initialize the template.
					var html = gaikan.runtime.render(response.root, null, response.file);
					// Set the container template.
					$(container).html(html);
					// Push the state to history.
					window.history.pushState(response, 'Gaikan', $(self).attr('action'));
					// Set the loading state.
					isLoading = false;
				}
			});
			// Return false.
			return false;
		});
		// Occurs when a history state is popped.
		window.onpopstate = function (ev) {
			// Check if the event is valid.
			if (ev && ev.state) {
				// Initialize the template.
				var html = gaikan.runtime.render(ev.state.root, null, ev.state.file);
				// Set the container template.
				$(container).html(html);
			}
		};
	}
	// Initialize the runtime.
	gaikan.runtime = (function () {
		// Initialize the escape regular expressions.
		var escape = /[&<>"'`]/, escapeAmpExp = /&/g, escapeLtExp = /</g, escapeGtExp = />/g, escapeQuotExp = /"/g;
		// Initialize the runtime.
		var runtime = {};
		// Initialize the templates.
		var templates = {/*TEMPLATES*/};
		// The filters.
		runtime.filters = {
			// Include the isEmpty filter.
			isEmpty: function (value) {
				// Check if the value is invalid or is an empty array.
				if (!value || (value.constructor === Array && !value.length)) {
					// Return true.
					return true;
				}
				// Iterate through each property.
				for (var key in value) {
					// Check if this property is owned by the value.
					if (value.hasOwnProperty(key)) {
						// Return false.
						return false;
					}
				}
				// Return true.
				return true;
			},
			// Include the sort filter.
			sort: function (value, reverse, orderBy) {
				// Check if reverse is not a boolean.
				if (typeof reverse !== 'boolean') {
					// Set the key for an array of objects to sort on.
					orderBy = reverse;
					// Set the status indicating whether the sorting is to be reversed.
					reverse = false;
				}
				// Check if the value is valid.
				if (value) {
					// Check if the value is an array.
					if (value.constructor === Array) {
						// Check if the value should be sorted.
						if (value.length > 1) {
							// Check if the key has been provided.
							if (orderBy) {
								// Sort the array.
								value.sort(function (a, b) {
									// Retrieve the orderBy for a.
									var x = a[orderBy];
									// Retrieve the orderBy for b.
									var y = b[orderBy];
									// Return the sort order.
									return x < y ? -1 : (x > y ? 1 : 0);
								});
							}
							// Otherwise this is a regular sort.
							else {
								// Sort the array.
								value.sort();
							}
							// Check if the sorting should be reversed.
							if (reverse) {
								// Reverse the array.
								value.reverse();
							}
						}
					}
					// Otherwise check if the value is an object.
					else if (value.constructor === Object) {
						// Initialize the working array.
						var working = [];
						// Iterate through each value.
						for (var key in value) {
							// Check if the key is a property of the statements object.
							if (value.hasOwnProperty(key)) {
								// Push the value.
								working.push(key);
							}
						}
						// Check if there are properties to sort.
						if (working.length > 1) {
							// Initialize the result.
							var result = {};
							// Sort the working array.
							working.sort();
							// Check if the sorting should be reversed.
							if (reverse) {
								// Reverse the array.
								working.reverse();
							}
							// Iterate through each item in the array.
							for (var key = 0; key < working.length; key += 1) {
								// Add the key and value to the result object.
								result[working[key]] = value[working[key]];
							}
							// Return the result.
							return result;
						}
					}
				}
				// Return the value.
				return value;
			}
		};
		// The handlers.
		runtime.handlers = {
			// Include the escape handler.
			escape: function (value) {
				// Check if the value is not an escape candidate.
				if (typeof value !== 'string' || !escape.test(value)) {
					// Return the value.
					return value;
				}
				// Test the value and escape it when necessary.
				return value.replace(escapeAmpExp, '&#38;').replace(escapeLtExp, '&#60;').replace(escapeGtExp, '&#62;').replace(escapeQuotExp, '&#34;');
			},
			// Include the lower handler.
			lower: function (value) {
				// Return the value.
				return String(value).toLowerCase();
			},
			// Include the nl2br handler.
			nl2br: function (value) {
				// Replace the new lines to break elements.
				return String(value).replace(/\n/g, '<br />');
			},
			// Include the title handler.
			title: function (value) {
				// Change the value to title case.
				return String(value).replace(/\w\S*/g, function (txt) {
					// Ensure the first character is upper case and the remaining text lower case.
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
			},
			// Include the unescape handler.
			unescape: function (value) {
				// Return the value.
				return String(value).replace(/&#([0-9]{2});/g, function (match, oct) {
					return String.fromCharCode(parseInt(oct, 10));
				})
			},
			// Include the upper handler.
			upper: function (value) {
				// Return the value.
				return String(value).toUpperCase();
			},
			// Include the url handler.
			url: function (value) {
				// Return the value.
				return encodeURIComponent(String(value));
			},
		};
		// Render a view from file.
		runtime.render = function (root, inputPartials, file) {
			// Render a view.
			return templates[file.replace(/\\/g, '/')](runtime, root, inputPartials);
		};
		// Return the runtime.
		return runtime;
	})();
	// Return gaikan.
	return gaikan;
})($ === undefined ? null : $, '#content');

// Check if using as module.
if (typeof module !== 'undefined') {
	// Export Gaikan.
	module.exports = Gaikan;
}