/*jslint node: true*/
'use strict';
// Initialize the express module.
var express = require('express');
// Initialize the gaikan module.
var gaikan = require('../../'); // require('gaikan');
// Initialize the application.
var app = express();

// Configure gaikan to use the layout.
gaikan.options.layout = 'layout';
// Configure express to default to the html extension.
app.set('view engine', '.html');
// Configure express to use the gaikan template engine.
app.engine('html', gaikan);

// Register the index handler.
app.get('/', function (req, res) {
	// Render the template.
	res.render('index');
});

// Register the about handler.
app.get('/about', function (req, res) {
	// Render the template.
	res.render('about', {author: 'Roel van Uden'});
});

// Listen for incoming connections.
app.listen(process.env.PORT || 8080);