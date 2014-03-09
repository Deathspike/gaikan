// Enable restricted mode.
'use strict';
// Include the browserbuild module.
var browserbuild = require('browserbuild');
// Include the configuration file.
var config = require('../package.json');
// Include the fs module.
var fs = require('fs');
// Include the uglify-js module.
var uglifyjs = require('uglify-js');
// Build for the browser ...
browserbuild.render(['../lib'], {
	// ... with the lib folder as basepath ...
	basepath: ['../lib/'],
	// ... with the Gaikan as global name ...
	global: 'gaikan',
	// ... with the hook as entry ...
	main: 'index'
	// ... with the callback.
}, function (err, src) {
	// Check if an error has occurred.
	if (err) {
		// Throw the error.
		throw err;
	}
	// Write the file ...
	fs.writeFile(config.name + '-' + config.version + '.min.js',
		// ... with a minified source code ...
		uglifyjs.minify(src, {fromString: true}).code,
		// ... with the callback.
		function (err) {
		// Check if an error has occurred.
		if (err) {
			// Throw the error.
			throw err;
		}
	});
});