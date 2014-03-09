// Enable restricted mode.
'use strict';
// Initialize the associate function.
var associate;
// Initialize the textify function.
var textify;
// Initialize the tree function.
var tree;

/**
 * Represents the function performing parsing. The tokens are parsed and
 * associations are made between the syntactic relational pairs. A relational
 * tree is established for the associations and tokens.
 *
 * @param template The tokens.
 * @returns The tree.
 */
module.exports = function (tokens) {
	// Textify tokens between script element tokens.
	textify(tokens, 'script');
	// Textify tokens between style element tokens.
	textify(tokens, 'style');
	// Associate each beginning and ending token.
	associate(tokens);
	// Establish a tree for the tokens and associations.
	return tree(tokens);
};

/**
 * Associate each beginning and ending token.
 *
 * @param tokens The tokens.
 */
associate = function (tokens) {
	// Initialize the associated boolean.
	var hasAssociated = false;
	// Iterate through each token.
	for (var b = 0; b < tokens.length; b += 1) {
		// Initialize the beginning.
		var beginning = tokens[b];
		// Set the index.
		beginning.index = b;
		// Check if the beginning has been associated ...
		if (typeof beginning.association !== 'undefined' ||
			// ... or is not an element ...
			beginning.type !== 'element' ||
			// ... or is not a beginning ...
			!beginning.isBeginning ||
			// ... or is not standalone.
			beginning.isStandalone) {
			// Continue iteration.
			continue;
		}
		// Iterate in reverse through each token to match an ending.
		for (var e = b + 1; e < tokens.length; e += 1) {
			// Initialize the ending.
			var ending = tokens[e];
			// Check if the ending has been associated ...
			if (typeof ending.association !== 'undefined' ||
				// ... or is not an element ...
				ending.type !== 'element' ||
				// ... or is a beginning ...
				ending.isBeginning ||
				// ... or does not match the name of the beginning.
				beginning.name.toLowerCase() !== ending.name.toLowerCase()) {
				// Continue iteration.
				continue;
			}
			// Iterate through each token to validate the beginning.
			for (var v = e - 1; v >= b; v -= 1) {
				// Initialize the validation.
				var validate = tokens[v];
				// Check if the validation has been associated ...
				if (typeof validate.association !== 'undefined' ||
					// ... or is not an element ...
					validate.type !== 'element' ||
					// ... or is not a beginning ...
					!validate.isBeginning ||
					// ... or is standalone ...
					validate.isStandalone ||
					// ... or does not match the name of the ending.
					validate.name.toLowerCase() !== ending.name.toLowerCase()) {
					// Continue iteration.
					continue;
				}
				// Check if the beginning matches the validation for the ending.
				if (b === v) {
					// Set the associated boolean.
					hasAssociated = true;
					// Set the beginning association.
					beginning.association = e;
					// Set the ending association.
					ending.association = b;
				}
				// Break the iteration.
				break;
			}
			// Break the iteration.
			break;
		}
	}
	// Check if associations have been established.
	if (hasAssociated) {
		// Recursively associate each beginning and ending token.
		associate(tokens);
	}
};

/**
 * Textify tokens between the specified element tokens.
 *
 * @param tokens The tokens.
 * @param name The name.
 */
textify = function (tokens, name) {
	// Initialize the textify boolean.
	var isTextifying = false;
	// Iterate through each token.
	for (var i = 0; i < tokens.length; i += 1) {
		// Initialize the token.
		var token = tokens[i];
		// Check if the token is an element ...
		if (token.type === 'element' &&
			// ... and is not standalone ...
			!token.isStandalone &&
			// ... and matches the specified element name.
			token.name.toLowerCase() === name.toLowerCase()) {
			// Set the textifying boolean.
			isTextifying = token.isBeginning;
			// Continue iteration.
			continue;
		}
		// Check if textification is set.
		if (isTextifying) {
			// Set the token type.
			token.type = 'text';
			// Delete the token attributes.
			delete token.attributes;
			// Delete the token name.
			delete token.name;
			// Delete the token beginning boolean.
			delete token.isBeginning;
			// Delete the token standalone boolean.
			delete token.isStandalone;
		}
	}
};

/**
 * Establish a tree for the tokens and associations.
 *
 * @param tokens The tokens.
 * @returns The tree.
 */
tree = function (tokens) {
	// Initialize the indentation.
	var indent = 0;
	// Initialize the tree.
	var tree = [];
	// Initialize the references stack.
	var stack = [tree];
	// Iterate through each token.
	for (var i = 0; i < tokens.length; i += 1) {
		// Initialize the token.
		var token = tokens[i];
		// Initialize the associated boolean.
		var isAssociated = typeof token.association !== 'undefined';
		// Check if the an association decreases indentation.
		if (isAssociated && token.association < i) {
			// Decrease the indentation.
			indent -= 1;
			// Pop a reference.
			stack.pop();
		}
		// Set the indentation.
		token.indent = indent;
		// Push the reference.
		stack[stack.length - 1].push(token);
		// Check if the an association increases indentation.
		if (isAssociated && token.association > i) {
			// Increase the indentation.
			indent += 1;
			// Set the children for the token.
			token.children = [];
			// Push the reference.
			stack.push(token.children);
		}
	}
	// Return the tree.
	return tree;
};