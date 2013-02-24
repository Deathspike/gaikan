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
	// Include the in statement.
	'data-in': require('./statements/in-statement'),
	// Include the for statement.
	'data-for': require('./statements/for-statement'),
	// Include the each statement (DECREPATED).
	'data-each': require('./statements/in-statement'),
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
	// Arrange attributes to a ensure a correct order.
	arrange(attributes);
	// Set the insert position.
	state.insert = -1;
	// Iterate through each attribute.
	for (var i = 0; i < attributes.length; i += 1) {
		// Check if the attribute is a recognized statement.
		if (attributes[i].key in statements && statements[attributes[i].key] && typeof statements[attributes[i].key].begin === 'function') {
			// Check if the insert position has not been set.
			if (state.insert === -1) {
				// Set the insert position.
				state.insert = state.instructions.length;
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
	// Return the status indicating whether the element is allowed to be disposed of.
	return state.insert !== -1;
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
	// Check if the instructions are available.
	if (state.instructions.length && state.instructions[0].cmd !== undefined) {
		// Push the instruction to define the result.
		state.instructions.unshift({cmd: 'var result = \'\';'});
		// Push the instruction to define the handlers.
		state.instructions.unshift({cmd: 'var handlers = runtime.handlers;'});
		// Push the instruction to define the filters.
		state.instructions.unshift({cmd: 'var filters = runtime.filters;'});
		// Push the instruction to define the data and parent.
		state.instructions.unshift({cmd: 'var data = root, parent = root;'});
		// Push the instruction to join and return the result.
		state.instructions.push({cmd: 'return result;'});
		// Optimize instructions.
		optimize(state);
	}
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
	// Initialize the result.
	var result = {cmd: utils.inline(text), type: 'text'};
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
	var result = {cmd: name, type: 'variable'};
	// Check if escaping of HTML is required.
	if (escapeHtml) {
		// Push the escape handler to the handlers.
		handlers.push('escape');
	}
	// Iterate through each handler.
	for (var i = 0; i < handlers.length; i += 1) {
		// Set the command to include the handler invocation.
		result.cmd = 'handlers.' + handlers[i] + '(' + result.cmd + ')';
	}
	// Set the command to include an undefined check.
	result.cmd = '(' + name + ' === undefined ? \'\' : ' + result.cmd + ')';
	// Check if the variable is contained in an opening literal and is to be inserted.
	if (state.insert !== -1 && isOpening) {
		// Insert the variable.
		state.instructions.splice(state.insert, 0, result);
		// Increment the insert location.
		state.insert += 1;
	}
	// Otherwise it is a regular variable.
	else {
		// Push the variable.
		state.instructions.push(result);
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
 * Optimize instructions
 *
 * @param state The state.
 */
function optimize(state) {
	// Initialize the current indentation.
	var currentIndent = 1;
	// Iterate through the instructions to join text.
	for (var i = 0; i < state.instructions.length; i += 1) {
		// Check if the current and next instruction are both text instructions.
		if (i + 1 < state.instructions.length && state.instructions[i].type === 'text' && state.instructions[i + 1].type === 'text') {
			// Append the next instruction command to the current command.
			state.instructions[i].cmd += state.instructions[i + 1].cmd;
			// Remove the next instruction command.
			state.instructions.splice(i + 1, 1);
			// Decrement the iterator.
			i -= 1;
		}
		// Otherwise check if the current instruction is text.
		else if (state.instructions[i].type === 'text') {
			// Change the command to include the outer quotes for the text.
			state.instructions[i].cmd = '\'' + state.instructions[i].cmd + '\'';
		}
	}
	// Iterate through the instructions to join text and variables.
	for (var i = 0; i < state.instructions.length; i += 1) {
		// Determine whether the current instruction is joinable.
		var isJoinable = state.instructions[i].type === 'text' || state.instructions[i].type === 'variable';
		// Check if the current and next instruction are joinable.
		if (i + 1 < state.instructions.length && isJoinable && (state.instructions[i + 1].type === 'text' || state.instructions[i + 1].type === 'variable')) {
			// Append the next instruction command to the current command.
			state.instructions[i].cmd += ' + ' + state.instructions[i + 1].cmd;
			// Remove the next instruction command.
			state.instructions.splice(i + 1, 1);
			// Decrement the iterator.
			i -= 1;
		}
		// Otherwise check if the current instruction is joinable.
		else if (isJoinable) {
			// Change the command to be appended to the result.
			state.instructions[i].cmd = 'result += ' + state.instructions[i].cmd + ';';
		}
	}
	// Iterate through each instruction to flatten the object to a command.
	for (var i = 0; i < state.instructions.length; i += 1) {
		// Check if the indentation is decreasing.
		if (state.instructions[i].indent < 0) {
			// Decrease the indentation.
			currentIndent -= -state.instructions[i].indent;
		}
		// Iterate for each level of indentation.
		for (var j = 0; j < currentIndent; j += 1) {
			// Prepend the command with the indentation.
			state.instructions[i].cmd = '\t' + state.instructions[i].cmd;
		}
		// Check if the indentation is increasing.
		if (state.instructions[i].indent > 0) {
			// Increment the indentation.
			currentIndent += state.instructions[i].indent;
		}
		// Change the instruction to a command.
		state.instructions[i] = state.instructions[i].cmd;
	}
}