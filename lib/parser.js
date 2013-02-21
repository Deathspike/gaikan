/**
 * Represents the module performing parsing. The parser is used by the compiler to parse the
 * piece of information with a status assigned by lexical anylsis and fills the state with parsed
 * instructions the compiler can use to create a function.
 */
var utils = require('./utils')

/**
 * The statements.
 */
var statements = {
	// Include the include statement.
	'data-include': require('./statements/include-statement'),
	// Include the partial statement.
	'data-partial': require('./statements/partial-statement'),
	// Include the if statement.
	'data-if': require('./statements/if-statement'),
	// Include the each statement.
	'data-each': require('./statements/each-statement')
};

/**
 * Parse a beginning statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 * @returns Indicates whether the element is allowed to be disposed of.
 */
module.exports.begin = function (state, attributes) {
	// Initialize the attribute to delete.
	var attributesToDelete = [];
	// Arrange attributes to a ensure a correct order.
	arrange(attributes);
	// Set the element insert to invalid.
	state.insert = -1;
	// Iterate through each attribute.
	for (var i = 0; i < attributes.length; i += 1) {
		// Check if the attribute is a recognized statement.
		if (attributes[i].key in statements && statements[attributes[i].key] && typeof statements[attributes[i].key].begin === 'function') {
			// Begin writing the statement.
			statements[attributes[i].key].begin(state, attributes[i]);
			// Push the attribute to the attribute deletion list.
			attributesToDelete.push(attributes[i].key);
		}
	}
	// Iterate through each attribute candidate for deletion.
	for (var i = 0; i < attributesToDelete.length; i += 1) {
		// Iterate through each attribute.
		for (var j = 0; j < attributes.length; j += 1) {
			// Check if the attribute should be deleted.
			if (attributes[j].key === attributesToDelete[i]) {
				// Delete the attribute.
				attributes.splice(j, 1);
				// Break from iteration;
				break;
			}
		}
	}
	// Return the status indicating whether the element is allowed to be disposed of.
	return state.insert !== -1;
};

/**
 * Parse an ending statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 */
module.exports.end = function (state, attributes) {
	// Arrange attributes to a ensure a proper emitting.
	arrange(attributes, true);
	// Iterate through each attribute.
	for (var i = 0; i < attributes.length; i += 1) {
		// Check if the attribute is a recognized statement.
		if (attributes[i].key in statements && statements[attributes[i].key] && typeof statements[attributes[i].key].end === 'function') {
			// End writing the statement.
			statements[attributes[i].key].end(state, attributes[i]);
		}
	}
};

/**
 * Parse the finalized instructions and return the function body.
 *
 * @param state The state.
 * @returns The function body.
 */
module.exports.finalize = function (state) {
	// Push the instruction to define the result.
	state.instructions.unshift('var result = \'\';');
	// Push the instruction to define the handlers.
	state.instructions.unshift('var handlers = runtime.handlers;');
	// Push the instruction to define the filters.
	state.instructions.unshift('var filters = runtime.filters;');
	// Push the instruction to define the data.
	state.instructions.unshift('var data = root;');
	// Push the instruction to join and return the result.
	state.instructions.push('return result;');
	// Returned the instructions.
	return state.instructions.join('');
};

/**
 * Parse an invocation statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 */
module.exports.invoke = function (state, attributes) {
	// Initialize the result.
	var result = false;
	// Arrange attributes to a ensure a proper emitting.
	arrange(attributes);
	// Iterate through each attribute.
	for (var i = 0; i < attributes.length; i += 1) {
		// Check if the attribute is a recognized statement.
		if (attributes[i].key in statements && statements[attributes[i].key] && typeof statements[attributes[i].key].invoke === 'function') {
			// End writing the statement.
			statements[attributes[i].key].invoke(state, attributes[i]);
			// Delete the attribute.
			delete attributes[i];
			// Set the result.
			result = true;
		}
	}
	// Return the result.
	return result;
};

/**
 * Parse text.
 *
 * @param state The state.
 * @param text The text.
 * @param isOpening Indicates whether the variable is contained in an opening literal.
 */
module.exports.text = function (state, text, isOpening) {
	// Initialize the result.
	var result = 'result += \'' + utils.inline(text) + '\';';
	// Check if the variable is contained in an opening literal and is to be inserted.
	if (state.insert !== -1 && isOpening) {
		// Insert the text.
		state.instructions.splice(state.insert, 0, result);
		// Increment the insert location.
		state.insert += 1;
	}
	// Otherwise it is a regular variable.
	else {
		// Push the text.
		state.instructions.push(result);
	}
};

/**
 * Parse a variable.
 *
 * @param state The state.
 * @param name The variable.
 * @param handlers Each handler.
 * @param escapeHtml Indicates whether escaping of HTML is required.
 * @param isOpening Indicates whether the variable is contained in an opening literal.
 */
module.exports.variable = function (state, name, handlers, escapeHtml, isOpening) {
	// Initialize the result.
	var result = name;
	// Check if escaping of HTML is required.
	if (escapeHtml) {
		// Push the escape handler to the handlers.
		handlers.push('escape');
	}
	// Iterate through each handler.
	for (var i = 0; i < handlers.length; i += 1) {
		// Set the result to include the handler invocation.
		result = 'handlers.' + handlers[i] + '(' + result + ')';
	}
	// Set the result to include checking for an undefined variable.
	result = name + ' === undefined ? \'\' : ' + result;
	// Check if the variable is contained in an opening literal and is to be inserted.
	if (state.insert !== -1 && isOpening) {
		// Insert the variable.
		state.instructions.splice(state.insert, 0, 'result += ' + result + ';');
		// Increment the insert location.
		state.insert += 1;
	}
	// Otherwise it is a regular variable.
	else {
		// Push the variable.
		state.instructions.push('result += ' + result + ';');
	}
};

/**
 * Arrange attributes to a ensure a correct order.
 *
 * @param attributes The attributes.
 * @param reverse Indicates whether the sorting is to be reversed.
 */
function arrange(attributes, reverse) {
	// Sort the attributes.
	attributes.sort(function (a, b) {
		// Retrieve the priority and sort accordingly.
		return reverse ? find(a.key) < find(b.key) : find(a.key) > find(b.key);
	});
}

/**
 * Find the priority index for the search input.
 *
 * @param search The search input.
 * @returns The priority index.
 */
function find(search) {
	// Initialize the index.
	var index = 0;
	// Iterate through each statement.
	for (var key in statements) {
		// Check if the key is a property of the statements object.
		if (statements.hasOwnProperty(key)) {
			// Check if the key matches the search input.
			if (key === search) {
				// Return the index.
				return index;
			}
			// Increment the index.
			index += 1;
		}
	}
	// Return an invalid index.
	return -1;
}