// Enable restricted mode.
'use strict';
// Initialize the attributes function.
var attributes;
// Initialize the tokenize function.
var tokenize;

/**
 * Represents the function performing lexical analysis. The template is
 * analysed and converted into a sequence of tokens. Each token contains
 * a group of characters and meta-data.
 *
 * @param template The template.
 * @returns The tokens.
 */
module.exports = function (template) {
	// Initialize the comment boolean.
	var isComment = false;
	// Initialize the element boolean.
	var isElement = false;
	// Initialize the position from which to tokenize.
	var from = 0;
	// Initialize the quote character.
	var quotes = null;
	// Initialize the previous character.
	var previousCharacter = 0;
	// Initialize the tokens.
	var tokens = [];
	// Iterate through each character in the template.
	for (var i = 0; i < template.length; i += 1) {
		// Initialize the character.
		var character = template.charAt(i);
		// Check if the token is an element.
		if (isElement) {
			// Check if this token is not a comment ...
			if (!isComment &&
				// ... the character is quote character ...
				(character === '\'' || character === '"') &&
				// ... and the quote character matches.
				(quotes === null || quotes === character)) {
				// Set the quote character.
				quotes = quotes === null ? character : null;
			}
			// Check if the character may indicate the end of the element ...
			if (character === '>' &&
				// ... the quote character is null ...
				quotes === null &&
				// ... and this is either no comment or a valid comment closing.
				(!isComment || /^-->$/.test(template.substr(i - 2, 3)))) {
				// Tokenize the group of characters.
				tokenize(tokens, template, from, i + 1);
				// Set the comment and element boolean.
				isComment = isElement = false;
				// Set the position from which to tokenize.
				from = i + 1;
			}
		} else if (character === '<') {
			// Initialize the validation string.
			var validate = template.substr(i, 9);
			// Initialize the validation comment boolean.
			var validateIsComment = /^<!--/.test(validate);
			// Check if the validation string is allowed.
			if (validateIsComment || /^(<!DOCTYPE|<\/?[a-z])/i.test(validate)) {
				// Tokenize the group of characters.
				tokenize(tokens, template, from, i);
				// Set the comment boolean.
				isComment = validateIsComment;
				// Set the element boolean.
				isElement = true;
				// Set the position from which to tokenize.
				from = i;
			}
		}
		// Set the previous character.
		previousCharacter = character;
	}
	// Tokenize the remaining group of characters.
	tokenize(tokens, template, from, template.length);
	// Return each token.
	return tokens;
};

/**
 * Tokenize the attributes.
 *
 * @param value The value.
 * @returns The attributes.
 */
attributes = function (value) {
	// Initialize the attributes.
	var attributes = [];
	// Initialize the match.
	var match = value.match(/^<[a-z0-9]+\s+?([\w\W]*?)\s?\/?>?$/i);
	// Check if the match is valid.
	if (match) {
		// Initialize the position.
		var position = -1;
		// Initialize the quote character.
		var quotes = null;
		// Initialize the value.
		value = match[1];
		// Iterate through each character, including the end, in the value.
		for (var i = position + 1; i <= value.length; i += 1) {
			// Initialize the boolean indicating if this is the final character.
			var isEnd = i === value.length;
			// Initialize the character.
			var character = isEnd ? null : value.charAt(i);
			// Check if the character is quote character ...
			if ((character === '\'' || character === '"') &&
				// ... and the quote character matches.
				(quotes === null || quotes === character)) {
				// Set the quote character.
				quotes = quotes === null ? character : null;
			}
			// Check if the character is a white-space between attributes.
			if (isEnd || (quotes === null && /^\s$/.test(character))) {
				// Initialize the attribute.
				var data = value.substr(position + 1, i - position - 1);
				// Initialize the index.
				var index = data.indexOf('=');
				// Check if the pair is valid.
				if (index !== -1) {
					// Initialize the meta-data ...
					var meta = {
						// ... with the key ...
						key: data.substr(0, index),
						// ... with the value.
						value: data.substr(index + 1)
					};
					// Initialize the length.
					var length = meta.value.length;
					// Check the quotes ...
					if ((meta.quote = length &&
						// ... depending on if quotes are present ...
						/"|'/.test(meta.value.charAt(0)) ?
						// ... and use the appropriate quote.
						meta.value.charAt(0) : null)) {
						// Check if the first character is a quote.
						if (meta.value.charAt(0) === meta.quote) {
							// Remove the first character.
							meta.value = meta.value.substr(1);
							// Decrement the length.
							length -= 1;
						}
						// Check if the last character is a quote.
						if (meta.value.charAt(length - 1) === meta.quote) {
							// Remove the last character.
							meta.value = meta.value.substr(0, length - 1);
							// Set the state indicating an end quote is present.
							meta.hasEndQuote = true;
						}
					}
					// Push the meta-data to the attributes.
					attributes.push(meta);
				} else if (data !== '/') {
					// Push the meta-data to the attributes.
					attributes.push({key: data});
				}
				// Set the position.
				position = i;
			}
		}
	}
	// Return the attributes.
	return attributes;
};

/**
 * Tokenize the group of characters.
 *
 * @param tokens Each token.
 * @param template The template.
 * @param from The position from which is tokenized.
 * @param to The position to which is tokenized.
 */
tokenize = function (tokens, template, from, to) {
	// Check if the length of the group of characters is valid.
	if (from !== to) {
		// Initialize the value.
		var value = template.substr(from, to - from);
		// Initialize the token.
		var token = {value: value, position: from, type: 'element'};
		// Push the token.
		tokens.push(token);
		// Check if this is a text element.
		if (value[0] !== '<' || !/>$/.test(value)) {
			// Set the type.
			token.type = 'text';
		} else if (/^<!--/.test(value)) {
			// Set the type.
			token.type = 'comment';
		} else if (/^<!DOCTYPE/i.test(value)) {
			// Set the type.
			token.type = 'doctype';
		} else {
			// Set the name.
			token.name = value.match(/^<\/?([a-z0-9]*)/i)[1];
			// Check if the token is invalid.
			if (!token.name) {
				// Set the type.
				token.type = 'text';
			} else if ((token.isBeginning = /^<[a-z0-9]/i.test(value))) {
				// Set the attributes.
				token.attributes = attributes(value);
				// Set the standalone boolean.
				token.isStandalone = /\/>$/.test(value);
			} else {
				// Set the attributes.
				token.attributes = [];
				// Set the standalone boolean.
				token.isStandalone = false;
			}
		}
	}
};