// Enable restricted mode.
'use strict';

// Declare the modules.
var gaikan = require('../../'); // require('gaikan');
var express = require('express');
var app = express();

// Gaikan Configuration
gaikan.options.layout = 'layout';

// Express View Engine
app.set('view engine', '.html');
app.engine('html', gaikan);

// Express Routes
app.get('/', function (req, res) {
	res.render('index');
});
app.get('/about', function (req, res) {
	res.render('about', {author: 'Roel van Uden'});
});

// Listen for requests.
app.listen(8080);