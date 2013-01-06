/**
 * Represents the engine that is used for invocating a template that uses includes,
 * handlers or partials. The engine mediates and uses the library to pass the
 * appropriate values to each template or handler.
 *
 * @param gaikan The library.
 */
function Engine(gaikan) {
	// Set gaikan.
	this.gaikan = gaikan;
	// Initialize the handlers.
	this.handlers = {
		// Handler to change a string to escaped HTML.
		escape: function(value) {
			// Replace the string ...
			return String(value)
				// ... replace ampersand ...
				.replace(/&(?!\w+;)/g, '&amp;')
				// ... replace larger than ...
				.replace(/</g, '&lt;')
				// ... replace greater than ...
				.replace(/>/g, '&gt;')
				// ... and replace quotes.
				.replace(/"/g, '&quot;');
		},
		// Handler to change a string to lower case.
		lower: function(value) {
			// Return the upper-case string.
			return String(value).toLowerCase();
		},
		// Handler to change a string to title case.
		title: function(value) {
			// Change the string to title case.
			return String(value).replace(/\w\S*/g, function(txt) {
				// Ensure the first character is upper case, and the remaining lower case.
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		// Handler to change a string to URI encoding.
		url: function(value) {
			// Encode the URI.
			return encodeURI(String(value));
		},
		// Handler to change a string to upper case.
		upper: function(value) {
			// Return the upper-case string.
			return String(value).toUpperCase();
		}
	};
}

/**
 * Execute a template.
 *
 * @param path The path to the template.
 * @param values The values to use when rendering.
 * @param outputPartials The partials passed to the template.
 * @returns The rendered template.
 */
Engine.prototype.include = function (path, values, outputPartials) {
	// Compile a template from a path and include it.
	return this.gaikan.compileFromPath(path)(this, values, outputPartials);
};

/**
 * Execute a handler.
 *
 * @param name The name of the handler.
 * @param value The value to process with the handler.
 * @returns The (processed) value.
 */
Engine.prototype.handler = function (name, value) {
	// Return the value processed by the handler.
	return name in this.handlers ? this.handlers[name](value) : value;
};

/**
 * Execute a partial.
 *
 * @param path The path to the template.
 * @param inputPartials The partials passed from the template.
 * @returns The rendered template.
 */
Engine.prototype.partial = function (path, inputPartials) {
	// Check if the path is included in the partials and execute it.
	return inputPartials && path in inputPartials ? inputPartials[path]() : '';
};

// Check if module is defined.
if (typeof module !== undefined) {
	// Export the engine.
	module.exports = Engine;
}