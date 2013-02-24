/**
 * Represents the module performing compilation. The parser makes use of lexical
 * analysis to understand the template structure and extracts template pieces using
 * that understanding. Each template piece is categorized and forwarded to the emitter,
 * which emits functional code.
 */
var lexer = require('./lexer'),
	emitter = require('./emitter');

/**
 * Parse the template.
 *
 * @param view The template.
 * @param compress Indicates whether compression has been enabled.
 * @returns The parsed template.
 */
module.exports = function (template, compress) {
	// Validate and clean the template.
	template = compress ? clean(template).trim() : template.trim();
	// Parse the template for each association and section.
	return emitter.finalize(parseTemplate({depth: 0, insert: -1, level: 1, instructions: [], scope: []}, template, lexer(template), 0, template.length));
}

/**
 * Clean the template.
 *
 * @param template The template.
 * @returns The template.
 */
function clean(template) {
	// Remove each comment from the template.
	template = template.replace(/<!--[^\[]*?-->/gi, '');
	// Remove remaining duplicate whitespace.
	template = template.replace(/\s+/gi, ' ');
	// Remove each whitespace between elements.
	template = template.replace(/>\s+</gi, '><');
	// Return the template.
	return template;
}

/**
 * Parse the literal into variables and text.
 *
 * @param state The state.
 * @param literal The literal.
 * @param isOpeningElement Indicates whether the literal is an opening element.
 * @returns The state.
 */
function parseLiteral(state, literal, isOpeningElement) {
	// Check if the literal is valid.
	if (literal && literal.length) {
		// Initialize the current position.
		var currentPosition = 0;
		// Initialize the variables
		var index, match, remainingText;
		// Initialize the variable regular expression.
		var variable_regex = /(\#|\!)\{(.+?)\}/gi;
		// Iterate through each match.
		while ((match = variable_regex.exec(literal)) !== null) {
			// Delete the input from the match.
			delete match.input;
			// Initialize the handlers.
			var handlers = [];
			// Check if text is available to be written.
			if (match.index - currentPosition > 0) {
				// Emit text.
				emitter.text(state, literal.substr(currentPosition, match.index - currentPosition), isOpeningElement);
			}
			// Check if the variable name contains a function list.
			if ((index = match[2].search(/[|,]/)) !== -1) {
				// Split the handler list.
				var split = match[2].substr(index + 1).split(/[,|]/);
				// Iterate through each handler.
				for (var i = 0; i < split.length; i += 1) {
					// Check if the handler is valid.
					if (split[i].trim().length) {
						// Push the handler on the handler list.
						handlers.push(split[i].trim());
					}
				}
				// Set the variable name.
				match[2] = match[2].substr(0, index);
			}
			// Emit a variable.
			emitter.variable(state, match[2], handlers, match[1] === '#', isOpeningElement);
			// Move the current position to the position after the variable.
			currentPosition = match.index + match[0].length;
		}
		// Retrieve the remaining text and check if the remaining text is valid.
		if ((remainingText = literal.substr(currentPosition)) && remainingText.length) {
			// Emit text.
			emitter.text(state, remainingText, isOpeningElement);
		}
	}
	// Return the state.
	return state;
}

/**
 * Parse the section into invocables and literals.
 *
 * @param state The state.
 * @param section The section.
 * @param analysis The lexical analysis.
 * @param position The position of the section.
 * @returns The state.
 */
function parseSection(state, section, analysis, position) {
	// Check if the section is valid.
	if (section && section.length) {
		// Initialize the current position.
		var currentPosition = position;
		// Initialize the dispose boolean.
		var disposed = false;
		// Iterate through each beginning element.
		for (var i = 0; i < analysis.beginnings.length; i += 1) {
			// Retrieve the beginning element.
			var beginning = analysis.beginnings[i];
			// Check if the beginning element is an invocation and is contained within the section.
			if (beginning[3] && beginning.index >= position && beginning.index < position + section.length) {
				// Parse the literal into variables and text.
				parseLiteral(state, section.substr(currentPosition - position, beginning.index - currentPosition));
				// Emit an invocation statement and check if it is not be disposed of.
				if (!(disposed = emitter.invoke(state, beginning.attributes) && beginning[1] === 'ins')) {
					// Check if the opening element has attributes.
					if (beginning.attributes.length) {
						// Initialize the attributes.
						var attributes = [];
						// Iterate through each attribute.
						for (var j = 0; j < beginning.attributes.length; j += 1) {
							// Check if the attribute is valid.
							if (beginning.attributes[j]) {
								// Combine the key and value for the attribute.
								attributes.push(beginning.attributes[j].key + '="' + beginning.attributes[j].value + '"');
							}
						}
						// Parse the literal into variables and text.
						parseLiteral(state, '<' + beginning[1] + (attributes.length === 0 ? '' : ' ' + attributes.join(' ')) + '>');
					}
					// Otherwise the opening element has no attributes.
					else {
						// Parse the literal into variables and text.
						parseLiteral(state, '<' + beginning[1] + '>');
					}
				}
				// Move the current position to the position after the invocable.
				currentPosition = beginning.index + beginning[0].length;
			}
		}
		// Parse the literal into variables and text.
		parseLiteral(state, section.substr(currentPosition - position));
	}
	// Return the state.
	return state;
}

/**
 * Parse the template into associations and sections.
 *
 * @param state The state.
 * @param template The template.
 * @param analysis The lexical analysis.
 * @param left The left boundary.
 * @param right The right boundary.
 * @returns The state.
 */
function parseTemplate(state, template, analysis, left, right) {
	// Check if the template is valid.
	if (template && template.length) {
		// Initialize the current position.
		var currentPosition = left;
		// Initialize the dispose boolean.
		var disposed = false;
		// Iterate through each association.
		for (var i = 0; i < analysis.associations.length; i += 1) {
			// Check if the association is contained within the boundaries.
			if (analysis.associations[i].beginning.index >= currentPosition && analysis.associations[i].beginning.index >= left && analysis.associations[i].ending.index + analysis.associations[i].ending[0].length <= right) {
				// Clone the attributes. This allows the writer to use possibly deleted attribute information on element endings.
				var attributesSliced = analysis.associations[i].beginning.attributes.slice(0);
				// Parse the section into invocables and literals.
				parseSection(state, template.substr(currentPosition, analysis.associations[i].beginning.index - currentPosition), analysis, currentPosition);
				// Emit a beginning statement and check if the element is not be disposed of.
				if (!(disposed = emitter.begin(state, analysis.associations[i].beginning.attributes) && analysis.associations[i].beginning[1] === 'ins')) {
					// Check if the opening element has attributes.
					if (analysis.associations[i].beginning.attributes.length) {
						// Initialize the attributes.
						var attributes = [];
						// Iterate through each attribute.
						for (var j = 0; j < analysis.associations[i].beginning.attributes.length; j += 1) {
							// Check if the attribute is valid.
							if (analysis.associations[i].beginning.attributes[j]) {
								// Combine the key and value for the attribute.
								attributes.push(analysis.associations[i].beginning.attributes[j].key + '="' + analysis.associations[i].beginning.attributes[j].value + '"');
							}
						}
						// Process a literal for each variable and remaining text.
						parseLiteral(state, '<' + analysis.associations[i].beginning[1] + (attributes.length === 0 ? '' : ' ' + attributes.join(' ')) + '>', true);
					}
					// Otherwise the opening element has no attributes.
					else {
						// Process a literal for each variable and remaining text.
						parseLiteral(state, '<' + analysis.associations[i].beginning[1] + '>', true);
					}
				}
				// Recursively parse the template into analysis.associations and sections.
				parseTemplate(state, template, analysis, analysis.associations[i].beginning.index + analysis.associations[i].beginning[0].length, analysis.associations[i].ending.index);
				// Emit an ending statement.
				emitter.end(state, attributesSliced);
				// Move the current position to the position after the association.
				currentPosition = analysis.associations[i].ending.index + analysis.associations[i].ending[0].length;
				// Check if the element is not be disposed of and write the ending element.
				if (!disposed) {
					// Parse the literal into variables and text.
					parseLiteral(state, '</' + analysis.associations[i].beginning[1] + '>');
				}
			}
		}
		// Parse the section into invocables and literals.
		parseSection(state, template.substr(currentPosition, right - currentPosition), analysis, currentPosition);
	}
	// Return the state.
	return state;
}