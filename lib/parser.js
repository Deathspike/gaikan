/**
 * Represents the parser capable of parsing HTML templates. The parser uses a Writer
 * instance to use the obtained intelligence and write instructions leading to a
 * functional JavaScript implementation which relies on an engine to mediate template
 * completion.
 *
 * @param writer The writer.
 */
function Parser(writer) {
	// Set the writer.
	this.writer = writer;
}

/**
 * Assign attribute information to each beginning element.
 *
 * @param beginnings Each beginning element.
 * @returns Each beginning element with attribute information, or null.
 */
Parser.prototype.assign = function (beginnings) {
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
						if ((index = attribute.indexOf('=')) === -1) {
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
				else if (previousCharacter !== '\\' && (character === '\'' || character === '"')) {
					// Set the quotes identifier.
					quotes = quotes === null ? character : (quotes === character ? null : quotes);
				}
				// Set the previous character.
				previousCharacter = character;
			}
			// Check if the quotes identifier is set.
			if (quotes !== null) {
				// Return null.
				return null;
			}
		}
	}
	// Return each beginning.
	return beginnings;
};

/**
 * Associate each beginning and ending element.
 *
 * @param beginningsAndEndings Each beginning and ending
 * @returns Each association, or null.
 */
Parser.prototype.associate = function (beginningsAndEndings) {
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
			// Initialize the matched boolean.
			var matched = false;
			// Iterate through each ending element.
			for (var j = 0; j < beginningsAndEndings.endings.length; j += 1) {
				// Retrieve the ending element.
				var ending = beginningsAndEndings.endings[j];
				// Check if the ending element is a potential match for the beginning element.
				if (beginning.index < ending.index && beginning[1] === ending[1]) {
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
			// Check if the beginning element has not been associated.
			if (!matched) {
				// Return false.
				return false;
			}
		}
	}
	// Determine if the associations are valid and return the associations, or null.
	return associations.length === beginningsAndEndings.endings.length ? associations : null;
};

/**
 * Clean the template.
 *
 * @param template The template.
 * @returns The template, or null.
 */
Parser.prototype.clean = function (template) {
	// Remove each comment from the template and check if the template is invalid.
	template = template.replace(/<!--[^\[]*?-->/gi, '');
	// Remove each whitespace between elements and check if the template is invalid.
	template = template.replace(/(<=>)\s+|\s+(?=<)/gi, '');
	// Remove remaining duplicate whitespace and check if the template is invalid.
	template = template.replace(/\s+/gi, ' ');
	// Determine if the template is valid and return it, or null.
	return template.length === 0 ? null : template;
};

/**
 * Capture each beginning and ending element.
 *
 * @param template The template.
 * @returns Each beginning and ending, or null.
 */
Parser.prototype.capture = function (template) {
	// Initialize the beginnings.
	var beginnings = [];
	// Initialize the beginnings regular expression.
	var beginnings_regex = /<([\w]+)(.*?)(\/)?>/gi;
	// Initialize the match.
	var match;
	// Iterate through each match.
	while ((match = beginnings_regex.exec(template)) !== null) {
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
		for (var i = match.index; i < template.length; i += 1) {
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
	// Check if a beginning is available.
	if (beginnings.length > 0) {
		// Initialize the endings.
		var endings = [];
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
		// Check if an ending is available.
		if (endings.length > 0) {
			// Return each beginning and ending.
			return { beginnings: beginnings, endings: endings };
		}
	}
	// Return null.
	return null;
};

/**
 * Compile a template.
 *
 * @throws Throws an exception when the template is invalid.
 * @param template The template.
 * @returns The compiled template.
 */
Parser.prototype.compile = function (template) {
	// Initialize variables.
	var associations, beginningsAndEndings;
	// Clean the template and check if it failed.
	if ((template = this.clean(template)) === null) {
		// Throw an exception.
		throw 'Error cleaning the template.';
	}
	// Otherwise capture each beginning and ending element and check if it failed.
	else if ((beginningsAndEndings = this.capture(template)) === null) {
		// Throw an exception.
		throw 'Error capturing each beginning and ending element.';
	}
	// Otherwise assign attribute information to each association and check if it failed.
	else if ((beginningsAndEndings.beginnings = this.assign(beginningsAndEndings.beginnings)) === null) {
		// Throw an exception.
		throw 'Error assigning attribute information to each association.';
	}
	// Otherwise associate each beginning and ending element and check if it failed.
	else if ((associations = this.associate(beginningsAndEndings)) === null) {
		// Throw an exception.
		throw 'Error associationg each beginning and ending element.';
	}
	// Otherwise compile the template.
	else {
		// Process a template for each association and section.
		this.template(template, beginningsAndEndings, associations, 0, template.length);
		// Convert the written instructions to a functional JavaScript implementation.
		return this.writer.toString();
	}
};

/**
 * Process a literal for each variable and remaining text.
 *
 * @param literal The literal.
 * @param isOpeningElement Indicates whether this literal is an opening element.
 */
Parser.prototype.literal = function (literal, isOpeningElement) {
	// Check if the literal is valid.
	if (literal && literal.length) {
		// Initialize the current position.
		var currentPosition = 0;
		// Initialize the variables
		var index, match, remainingText;
		// Initialize the variable regular expression.
		var variable_regex = /(\#|\!)\{([a-z0-9|.,]+)\}/gi;
		// Iterate through each match.
		while ((match = variable_regex.exec(literal)) !== null) {
			// Delete the input from the match.
			delete match.input;
			// Initialize the handlers.
			var handlers = [];
			// Check if text is available to be written.
			if (match.index - currentPosition > 0) {
				// Add literal text.
				this.writer.text(literal.substr(currentPosition, match.index - currentPosition), isOpeningElement);
			}
			// Check if the variable name contains a function list.
			if ((index = match[2].search(/[|,]/)) !== -1) {
				// Split the handler list.
				var split = match[2].substr(index + 1).split(/[,|]/);
				// Iterate through each handler.
				for (var i = 0; i < split.length; i += 1) {
					// Check if the handler is valid.
					if (split[i].length) {
						// Push the handler on the handler list.
						handlers.push(split[i]);
					}
				}
				// Set the variable name.
				match[2] = match[2].substr(0, index);
			}
			// Add a variable using each handler.
			this.writer.variable(match[2], handlers, match[1] === '#', isOpeningElement);
			// Move the current position to the position after the variable.
			currentPosition = match.index + match[0].length;
		}
		// Retrieve the remaining text and check if the remaining text is valid.
		if ((remainingText = literal.substr(currentPosition)) && remainingText.length) {
			// Add literal text.
			this.writer.text(remainingText, isOpeningElement);
		}
	}
};

/**
 * Process a section for invocables and literals.
 *
 * @param section The section.
 * @param beginningsAndEndings Each beginning and ending
 * @param position The position of the section.
 */
Parser.prototype.section = function (section, beginningsAndEndings, position) {
	// Check if the section is valid.
	if (section && section.length) {
		// Initialize the current position.
		var currentPosition = position;
		// Initialize the dispose boolean.
		var disposed = false;
		// Iterate through each beginning element.
		for (var i = 0; i < beginningsAndEndings.beginnings.length; i += 1) {
			// Retrieve the beginning element.
			var beginning = beginningsAndEndings.beginnings[i];
			// Check if the beginning element is an invocation and is contained within the section.
			if (beginning[3] && beginning.index >= position && beginning.index < currentPosition + section.length) {
				// Process a literal for each variable and remaining text.
				this.literal(section.substr(currentPosition - position, beginning[0][1] - currentPosition));
				// Invoke a non-nested command statement and check if it is not be disposed of.
				if (!(disposed = this.writer.invoke(beginning.attributes) && beginning[1] === 'ins')) {
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
						// Process a literal for each variable and remaining text.
						this.literal('<' + beginning[1] + (attributes.length == 0 ? '' : ' ' + attributes.join(' ')) + '>');
					}
					// Otherwise the opening element has no attributes.
					else {
						// Process a literal for each variable and remaining text.
						this.literal('<' + beginning[1] + '>');
					}
				}
				// Move the current position to the position after the invocable.
				currentPosition = beginning.index + beginning[0].length;
			}
		}
		// Process a literal for each variable and remaining text.
		this.literal(section.substr(currentPosition - position));
	}
};

/**
 * Process a template for each association and section.
 *
 * @param template The template.
 * @param beginningsAndEndings Each beginning and ending
 * @param associations Each association.
 * @param left The left boundary.
 * @param right The right boundary.
 */
Parser.prototype.template = function (template, beginningsAndEndings, associations, left, right) {
	// Check if the template is valid.
	if (template && template.length) {
		// Initialize the current position.
		var currentPosition = left;
		// Initialize the dispose boolean.
		var disposed = false;
		// Iterate through each association.
		for (var i = 0; i < associations.length; i += 1) {
			// Check if the association is contained within the boundaries.
			if (associations[i].beginning.index >= currentPosition && associations[i].beginning.index >= left && associations[i].ending.index + associations[i].ending[0].length <= right) {
				// Clone the attributes. This allows the writer to use possibly deleted attribute information on element endings.
				var attributesSpliced = associations[i].beginning.attributes.slice(0);
				// Process a section for invocables and literals.
				this.section(template.substr(currentPosition, associations[i].beginning.index - currentPosition), beginningsAndEndings, currentPosition);
				// Begin a command statement and check if the element is not be disposed of.
				if (!(disposed = this.writer.begin(associations[i].beginning.attributes) && associations[i].beginning[1] === 'ins')) {
					// Check if the opening element has attributes.
					if (associations[i].beginning.attributes.length) {
						// Initialize the attributes.
						var attributes = [];
						// Iterate through each attribute.
						for (var j = 0; j < associations[i].beginning.attributes.length; j += 1) {
							// Check if the attribute is valid.
							if (associations[i].beginning.attributes[j]) {
								// Combine the key and value for the attribute.
								attributes.push(associations[i].beginning.attributes[j].key + '="' + associations[i].beginning.attributes[j].value + '"');
							}
						}
						// Process a literal for each variable and remaining text.
						this.literal('<' + associations[i].beginning[1] + (attributes.length == 0 ? '' : ' ' + attributes.join(' ')) + '>', true);
					}
					// Otherwise the opening element has no attributes.
					else {
						// Process a literal for each variable and remaining text.
						this.literal('<' + associations[i].beginning[1] + '>', true);
					}
				}
				// Recursively process a template for each association and section.
				this.template(template, beginningsAndEndings, associations, associations[i].beginning.index + associations[i].beginning[0].length, associations[i].ending.index);
				// End a command statement.
				this.writer.end(attributesSpliced);
				// Move the current position to the position after the association.
				currentPosition = associations[i].ending.index + associations[i].ending[0].length;
				// Check if the element is not be disposed of and write the ending element.
				if (!disposed) {
					// Process a literal for each variable and remaining text.
					this.literal('</' + associations[i].beginning[1] + '>');
				}
			}
		}
		// Process a section for invocables and literals.
		this.section(template.substr(currentPosition, right - currentPosition), beginningsAndEndings, currentPosition);
	}
};

// Check if module is defined.
if (typeof module !== undefined) {
	// Export the parser class.
	module.exports = Parser;
}