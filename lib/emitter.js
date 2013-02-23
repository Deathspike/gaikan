/**
 * Represents the module performing instruction emitting. The emitter is used by the parser to
 * emit the instructions representing the actions that have been gathered by the parser and
 * lexical analyzer.
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
 * Emit a beginning statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 * @returns Indicates whether the element is allowed to be disposed of.
 */
module.exports.begin = function (state, attributes) {
	// Initialize the attribute to delete.
	var attributesToDelete = [];
	// Initialize the insert position boolean.
	var insertPositionHasSet = false;
	// Arrange attributes to a ensure a correct order.
	arrange(attributes);
	// Iterate through each attribute.
	for (var i = 0; i < attributes.length; i += 1) {
		// Check if the attribute is a recognized statement.
		if (attributes[i].key in statements && statements[attributes[i].key] && typeof statements[attributes[i].key].begin === 'function') {
			// Check if the insert position has not been set.
			if (!insertPositionHasSet) {
				// Flush buffered text.
				flush(state);
				// Set the defer status.
				state.defer = false;
				// Set the insert position.
				state.insert = state.instructions.length;
				// Set the insert position.
				insertPositionHasSet = true;
			}
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
	// Check if the insert position has not been set.
	if (!insertPositionHasSet) {
		// Set the defer status.
		state.defer = true;
	}
	// Return the status indicating whether the element is allowed to be disposed of.
	return insertPositionHasSet;
};

/**
 * Emit an ending statement.
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
			// Flush buffered text.
			flush(state);
			// End writing the statement.
			statements[attributes[i].key].end(state, attributes[i]);
		}
	}
};

/**
 * Emit the finalized state and return the function body.
 *
 * @param state The state.
 * @returns The function body.
 */
module.exports.finalize = function (state) {
	// Flush buffered text.
	flush(state);
	// Push the instruction to define the result.
	state.unshift('var result = \'\';');
	// Push the instruction to define the handlers.
	state.unshift('var handlers = runtime.handlers;');
	// Push the instruction to define the filters.
	state.unshift('var filters = runtime.filters;');
	// Push the instruction to define the data.
	state.unshift('var data = root;');
	// Push the instruction to join and return the result.
	state.push('return result;');
	// Returned the state.
	return state.instructions.join('\n');
};

/**
 * Emit an invocation statement.
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
			// Flush buffered text.
			flush(state);
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
 * Emit text.
 *
 * @param state The state.
 * @param text The text.
 * @param isOpening Indicates whether the variable is contained in an opening literal.
 */
module.exports.text = function (state, text, isOpening) {
	// Check if the buffer has been set and this is an opening insertation.
	if (state.buffer.length && state.insert !== -1 && (isOpening || state.buffer[0].isOpening !== isOpening)) {
		// Flush buffered text.
		flush(state);
	}
	// Buffer the text.
	state.buffer.push({isOpening: isOpening, text: text});
};

/**
 * Emit a variable.
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
	// Flush buffered text.
	flush(state);
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
		state.splice(state.insert, 0, 'result += ' + result + ';');
		// Increment the insert location.
		state.insert += 1;
	}
	// Otherwise it is a regular variable.
	else {
		// Push the variable.
		state.push('result += ' + result + ';');
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

/**
 * Flush buffered text.
 *
 * @param state The state.
 */
function flush(state) {
	// Check if a flush is required.
	if (state.buffer.length) {
		// Initialize the result.
		var result = '';
		// Iterate through each item in the buffer.
		for (var i = 0; i < state.buffer.length; i += 1) {
			// Initialize the result.
			result += utils.inline(state.buffer[i].text);
		}
		// Initialize the result.
		result = 'result += \'' + result + '\';';
		// Check if the variable is contained in an opening literal and is to be inserted.
		if (state.insert !== -1 && state.buffer[0].isOpening) {
			// Insert the text.
			state.splice(state.insert, 0, result);
			// Increment the insert location.
			state.insert += 1;
		}
		// Otherwise it is a regular variable.
		else {
			// Push the text.
			state.push(result);
		}
		// Clear the buffer.
		state.buffer = [];
	}
	// Check if insertation is deferred.
	if (state.defer) {
		// Set the defer status.
		state.defer = false;
		// Set the insert position.
		state.insert = -1;
	}
}