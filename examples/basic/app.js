/*jslint node: true*/
'use strict';
// Initialize the gaikan module.
var gaikan = require('../../'); // require('gaikan');
// Run the template.
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