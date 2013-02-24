/**
 * Parse a beginning each-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Retrieve the current number for the for-statement.
	var current = state.scope.length;
	// Push the number for the for-statement.
	state.scope.push(state.scope.length);
	// Push the instruction to initialize the target.
	state.instructions.push({cmd: 'var t' + current + ' = ' + attribute.value + ';'});
	// Push the instruction to open the for-statement.
	state.instructions.push({cmd: 'for (var key = 0, len = t' + current + '.length; key < len; key++) {', indent: 1});
	// Push the instruction to backup the data.
	state.instructions.push({cmd: 'var d' + current + ' = data;'});
	// Push the instruction to backup the key.
	state.instructions.push({cmd: 'var k' + current + ' = key;'});
	// Push the instruction to backup the length.
	state.instructions.push({cmd: 'var l' + current + ' = len;'});
	// Push the instruction to backup the parent.
	state.instructions.push({cmd: 'var p' + current + ' = parent;'});
	// Push the instruction to set the parent.
	state.instructions.push({cmd: 'parent = data;'});
	// Push the instruction to set the data.
	state.instructions.push({cmd: 'data = t' + current + '[key];'});
};

/**
 * Parse an end each-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Retrieve the current number for the for-statement.
	var current = state.scope.pop();
	// Push the instruction to restore the parent.
	state.instructions.push({cmd: 'parent = p' + current + ';'});
	// Push the instruction to restore the length.
	state.instructions.push({cmd: 'len = l' + current + ';'});
	// Push the instruction to restore the key.
	state.instructions.push({cmd: 'key = k' + current + ';'});
	// Push the instruction to restore the data.
	state.instructions.push({cmd: 'data = d' + current + ';'});
	// Push the instruction to close the for-statement.
	state.instructions.push({cmd: '}', indent: -1});
};