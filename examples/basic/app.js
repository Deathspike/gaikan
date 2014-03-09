// Enable restricted mode.
'use strict';

// Declare the modules.
var gaikan = require('../../'); // require('gaikan');

// Run the template and show the result.
console.log(gaikan('test', {
	children: [{
		name: 'Henk',
		age: 45
	}, {
		name: 'Bob',
		age: 30
	}, {
		name: 'Wes',
		age: 10
	}]
}));