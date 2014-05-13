/*jslint node: true*/
'use strict';
// Initialize the count.
var count = 100000;
// Initialize the data.
var data = require('./data');
// Initialize the gaikan module.
var gaikan = require('../../'); // require('gaikan');
// Initialize the test function.
var test = function (name) {
	// Initialize the compiled template.
	var compiled = gaikan.compileFromFile(name),
		// Initialize the iterator.
		i,
		// Initialize the start time.
		start = Date.now();
	// Iterate through each iteration.
	for (i = 0; i < count; i += 1) {
		// Execute the template.
		compiled(gaikan, data);
	}
	// Write the performance message.
	console.log(name + ': ' + (Date.now() - start) + 'ms');
};

// Ensure that caching is enabled.
gaikan.options.enableCache = true;
// Ensure thet compression is enabled.
gaikan.options.enableCompression = true;

// Test the escaped template.
test('escaped');
// Test the unescaped template.
test('unescaped');