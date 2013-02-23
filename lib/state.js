/**
 * Represents the module creating states. States are used to track changes in the parsing-
 * and emitting state of function creation and contains instructions, indentation and utilities
 * ensuring emitting is correct.
 */
module.exports = function () {
	// Initialize the object ...
	var obj = {
		// ... with a depth for includes and partials ...
		depth: 0,
		// ... with an inseration for literals and variables surrounding statements ...
		insert: -1,
		// ... with an indentation level ...
		level: 1,
		// ... and with the instructions.
		instructions: []
	};
	
	/**
	 * Indent an instruction.
	 *
	 * @param instruction The instruction.
	 * @param indent The indent changes.
	 * @param index The insertation index.
	 * @returns The indented instruction.
	 */
	obj.indent = function (instruction, indent, index) {
		// Check if the index has been provided and is valid.
		if (index !== undefined && obj.instructions[index]) {
			// Iterate while the instruction is valid and is an indentation.
			for (var i = 0; obj.instructions[index][i] === '\t'; i += 1) {
				// Prepend the instruction with an indentation.
				instruction = '\t' + instruction;
			}
		}
		// Otherwise this is a regular addition.
		else {
			// Validate and set the indent changes.
			indent = indent ? indent : 0;
			// Check if the indent change is negative.
			if (indent < 0) {
				// Decrement the indent.
				obj.level -= -indent;
			}
			// Iterate until the indentation level has been reached.
			for (var i = 0; i < obj.level; i += 1) {
				// Prepend the instruction with an indentation.
				instruction = '\t' + instruction;
			}
			// Check if the indent change is positive.
			if (indent > 0) {
				// Increment the indent.
				obj.level += indent;
			}
		}
		// Return the indented instruction.
		return instruction;
	};
	
	/**
	 * Push an instruction.
	 *
	 * @param instruction The instruction.
	 * @param indent The optional indent change.
	 */
	obj.push = function (instruction, indent) {
		// Push an instruction and change indentation.
		obj.instructions.push(obj.indent(instruction, indent));
	};
	
	/**
	 * Splice an instruction.
	 *
	 * @param index The index.
	 * @param howMany The amount of splicing.
	 * @param instruction The instruction.
	 */
	obj.splice = function (index, howMany, instruction) {
		// Splice an instruction.
		obj.instructions.splice(index, howMany, obj.indent(instruction, undefined, index));
	};
	
	/**
	 * Unshift an instruction.
	 *
	 * @param instruction The instruction.
	 */
	obj.unshift = function (instruction) {
		// Unshift an instruction.
		obj.instructions.unshift(obj.indent(instruction));
	};
	
	// Return the object.
	return obj;
}