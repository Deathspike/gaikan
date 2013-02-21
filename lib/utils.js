/**
 * Escapes the text for inline code.
 *
 * @param text The text.
 * @returns The escaped text.
 */
module.exports.inline = function (text) {
	// Initialize the result.
	var result = '';
	// Iterate through each character.
	for (var i = 0; i < text.length; i += 1) {
		// Switch based on the character.
		switch (text[i]) {
		case '\'':
			// Escape the character.
			result += '\\\'';
			break;
		case '\\':
			// Escape the character.
			result += '\\\\';
			break;
		case '\b':
			// Escape the character.
			result += '\\b';
			break;
		case '\f':
			// Escape the character.
			result += '\\f';
			break;
		case '\n':
			// Escape the character.
			result += '\\n';
			break;
		case '\r':
			// Escape the character.
			result += '\\r';
			break;
		case '\t':
			// Escape the character.
			result += '\\t';
			break;
		default:
			// Add the character.
			result += text[i];
			break;
		}
	}
	// Return the result.
	return result;
}

/**
 * Extract name- and data values.
 *
 * @param value The value.
 * @returns The name and data.
 */
module.exports.extract = function (value) {
	// Retrieve the index.
	var index = value.indexOf('|');
	// Return the values.
	return index === -1 ? {name: value, data: 'data'} : {name: value.substr(0, index), data: value.substr(index + 1)};
}