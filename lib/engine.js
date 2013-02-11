/**
 * Represents the engine that is used for invocating a template that uses includes,
 * handlers or partials. The engine mediates and uses the library to pass the
 * appropriate values to each template or handler.
 *
 * @param gaikan The gaikan library.
 */
function Engine(gaikan) {
	// Set gaikan.
	this.gaikan = gaikan;
	// Initialize the handlers.
	this.handlers = {
		// Handler to escape a value.
		escape: function (value) {
			// Return the escaped value.
			return String(value).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},
		// Handler to lower case a value.
		lower: function (value) {
			// Return the lower case value.
			return String(value).toLowerCase();
		},
		// Handler to convert new lines to break elements.
		nl2br: function (value) {
			// Replace the new lines to break elements.
			return String(value).replace(/\n/g, '<br />');
		},
		// Handler to title case a value.
		title: function (value) {
			// Change the value to title case.
			return String(value).replace(/\w\S*/g, function (txt) {
				// Ensure the first character is upper case and the remaining text lower case.
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		// Handler to encode a value.
		url: function (value) {
			// Encode the value.
			return encodeURI(String(value));
		},
		// Handler to upper case a value.
		upper: function (value) {
			// Return the upper case value.
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
 * @param values The values.
 * @param inputPartials The partials passed from the template.
 * @returns The rendered template.
 */
Engine.prototype.partial = function (path, values, inputPartials) {
	// Check if the path is included in the partials and execute it.
	return inputPartials && path in inputPartials ? inputPartials[path](this, values) : '';
};

// Check if module is defined.
if (typeof module !== undefined) {
	// Export the engine.
	module.exports = Engine;
}