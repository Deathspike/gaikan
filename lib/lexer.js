/**
 * Represents the module performing lexical analysis. The provided template is analysed
 * and each element is categorized as either a beginning or ending element. Each beginning
 * and ending element is attempted to be associated as an element pair.
 */

/**
 * Perform lexical analysis on the template.
 *
 * @param template The template.
 * @returns The analysis, or null.
 */
module.exports = function (template) {
	// Capture each beginning and ending element.
	var associations, beginningsAndEndings = capture(template);
	// Assign attribute information to each beginning element.
	beginningsAndEndings.beginnings = assign(beginningsAndEndings.beginnings);
	// Associate each beginning and ending element
	associations = associate(beginningsAndEndings);
	// Return each beginning, ending and association.
	return { associations: associations, beginnings: beginningsAndEndings.beginnings, endings: beginningsAndEndings.endings };
};

/**
 * Assign attribute information to each beginning element.
 *
 * @param beginnings Each beginning element.
 * @returns Each beginning element with attribute information, or null.
 */
function assign(beginnings) {
	// Initialize the variables.
	var attribute, index;
	// Iterate through each beginning.
	for (var i = 0; i < beginnings.length; i += 1) {
		// Initialize the attributes array.
		beginnings[i].attributes = [];
		// Check if the length of the attributes is not zero.
		if (beginnings[i][2].length) {
			// Initialize the previous position.
			var previousPosition = 0;
			// Initialize the previous character.
			var previousCharacter = null;
			// Initialize the quotes.
			var quotes = null;
			// Iterate through the characters of the attributes.
			for (var j = 0; j <= beginnings[i][2].length; j += 1) {
				// Retrieve the character at the current position.
				var character = j === beginnings[i][2].length ? null : beginnings[i][2].charAt(j);
				// Check if the character indicates a white space.
				if (j === beginnings[i][2].length || (quotes === null && (character === ' ' || character === '\t'))) {
					// Retrieve the attribute and check if the attribute is valid.
					if ((attribute = beginnings[i][2].substr(previousPosition, j - previousPosition).trim()) && attribute.length) {
						// Retrieve the index of the equals sign and check if the equals sign does not exist.
						if ((index = attribute.indexOf('=')) === -1 || attribute[0] === '!' || attribute[0] === '#') {
							// Add the attribute without an undefined value.
							beginnings[i].attributes.push({ key: attribute.toLowerCase().trim(), value: undefined });
						}
						//Otherwise the equal sign does exist.
						else {
							// Add the attribute with a value that has been stripped from quotes.
							beginnings[i].attributes.push({ key: attribute.substr(0, index).toLowerCase().trim(), value: attribute.substr(index + 1).trim().replace(/^("|')/gi, '').replace(/("|')$/gi, '') });
						}
					}
					// Set the previous position.
					previousPosition = j;
				}
				// Otherwise check if the character is a non-escaped quote.
				else if (previousCharacter !== '\\' && (character === '\'' || character === '"' || ((previousCharacter === '!' || previousCharacter === '#') && character === '{') || character === '}')) {
					// Set the character.
					character = character === '}' ? '{' : character;
					// Set the quotes identifier.
					quotes = quotes === null ? character : (quotes === character ? null : quotes);
				}
				// Set the previous character.
				previousCharacter = character;
			}
		}
	}
	// Return each beginning.
	return beginnings;
}

/**
 * Associate each beginning and ending element.
 *
 * @param beginningsAndEndings Each beginning and ending
 * @returns Each association, or null.
 */
function associate(beginningsAndEndings) {
	// Initialize the associations.
	var associations = [];
	// Iterate through each beginning element.
	for (var i = 0; i < beginningsAndEndings.beginnings.length; i += 1) {
		// Retrieve the beginning element.
		var beginning = beginningsAndEndings.beginnings[i];
		// Check if parser is a beginning element with nested content.
		if (beginning[3] === undefined) {
			// Initialize the invalidated candidates.
			var invalidated = [];
			// Iterate through each ending element.
			for (var j = 0; j < beginningsAndEndings.endings.length; j += 1) {
				// Retrieve the ending element.
				var ending = beginningsAndEndings.endings[j];
				// Check if the ending element is a potential match for the beginning element.
				if (beginning.index < ending.index && beginning[1] === ending[1]) {
					// Initialize the matched boolean.
					var matched = false;
					// Iterate through each beginning element in reverse to find candidates for the ending element invalidation.
					for (var k = beginningsAndEndings.beginnings.length - 1; k >= 0; k -= 1) {
						// Retrieve the candidate beginning element.
						var candidate = beginningsAndEndings.beginnings[k];
						// Check if the candidate element is a potential match for the ending element.
						if (candidate[3] === undefined && candidate.index < ending.index && candidate[1] === ending[1] && invalidated.indexOf(candidate) === -1) {
							// Check if the beginning and candidate element match.
							if (beginning === candidate) {
								// Set the matched boolean.
								matched = true;
								// Associate the beginning and ending element.
								associations.push({ beginning: beginning, ending: ending });
							}
							// Otherwise the beginning and candidate element do not match.
							else {
								// Invalidate the candidate element.
								invalidated.push(candidate);
							}
							// Break from candidate iteration.
							break;
						}
					}
					// Check if the beginning element has been associated.
					if (matched) {
						// Break from ending iteration.
						break;
					}
				}
			}
		}
	}
	// Return the associations.
	return associations;
}

/**
 * Capture each beginning and ending element.
 *
 * @param template The template.
 * @returns Each beginning and ending, or null.
 */
function capture(template) {
	// Initialize the beginnings.
	var beginnings = [];
	// Initialize the beginnings regular expression.
	var beginnings_regex = /<([\w]+)(.*?)(\/)?>/gi;
	// Initialize the (conditional) comments.
	var comments = [];
	// Initialize the (conditional) comments regular expression.
	var comments_regex = /<!--.*?-->/gi;
	// Initialize the endings.
	var endings = [];
	// Initialize the match and iterator.
	var match, i;
	// Iterate through each comment match.
	while ((match = comments_regex.exec(template)) !== null) {
		// Delete the input from the match.
		delete match.input;
		// Push the match to the comments.
		comments.push(match);
	}
	// Iterate through each beginning match.
	while ((match = beginnings_regex.exec(template)) !== null) {
		// Initialize the boolean indicating whether the match is in a comment.
		var isInComment = false;
		// Iterate through each comment.
		for (i = 0; i < comments.length; i += 1) {
			// Check if the match is contained within a comment.
			if (match.index >= comments[i].index && match.index < comments[i].index + comments[i][0].length) {
				// Set the boolean.
				isInComment = true;
				// Break from the iteration.
				break;
			}
		}
		// Process the match when not in a comment.
		if (!isInComment) {
			// Delete the input from the match.
			delete match.input;
			// Ensure the tag name of the element is lower case.
			match[1] = match[1].toLowerCase();
			// Initialize the invalidated boolean.
			var invalidated = false;
			// Initialize the previous character.
			var previousCharacter = null;
			// Initialize the quotes identifier.
			var quotes = null;
			// Iterate through the characters at the position of the element.
			for (i = match.index; i < template.length; i += 1) {
				// Retrieve the character at the current position.
				var character = template.charAt(i);
				// Check if the curent character indicates the end of the element.
				if (character === '>') {
					// Check if the quoties identifier is null.
					if (quotes === null) {
						// Check if the element was invalidated.
						if (invalidated) {
							// Calculate the attributes index.
							var attributesIndex = match.index + match[1].length + 1;
							// Correct the element.
							match[0] = template.substr(match.index, i - match.index + 1);
							// Correct the element attributes.
							match[2] = template.substr(attributesIndex, i - attributesIndex);
						}
						// Break from the iteration.
						break;
					}
					// Invalidate the element.
					invalidated = true;
				}
				// Otherwise check if the character is a non-escaped single or double quote.
				else if (previousCharacter !== '\\' && (character === '\'' || character === '"')) {
					// Set the quotes identifier.
					quotes = quotes === null ? character : (quotes === character ? null : quotes);
				}
				// Set the previous character.
				previousCharacter = character;
			}
			// Push the match to the beginnings.
			beginnings.push(match);
		}
	}
	// Check if a beginning is available.
	if (beginnings.length > 0) {
		// Initialize the endings regular expression.
		var endings_regex = /<\/([\w]+)(\s+)?>/gi;
		// Iterate through each match.
		while ((match = endings_regex.exec(template)) !== null) {
			// Delete the input from the match.
			delete match.input;
			// Ensure the tag name of the element is lower case.
			match[1] = match[1].toLowerCase();
			// Push the match to the endings.
			endings.push(match);
		}
	}
	// Return each beginning and ending.
	return { beginnings: beginnings, endings: endings };
}