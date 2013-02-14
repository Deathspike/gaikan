// Include the engine.
var Engine = require('./lib/engine');
// Include the file system module.
var fs = require('fs');
// Include the path module.
var path = require('path');
// Include the compiler.
var compiler = require('./lib/compiler');
// Include the writer.
var Writer = require('./lib/writer');

/**
 * Represents the library capable of compiling and rendering templates. Options can
 * be configured to control caching (enabled, or depending on express), the view
 * directory and the default file extension.
 */
function Gaikan() {
	// Retrieve the parent.
	var parent = module.parent;
	// While the parent is valid.
	while (parent.parent) {
		// Set the parent.
		parent = parent.parent;
	}
	// Initialize a new instance of the Engine class.
	this.engine = new Engine(this);
	// Initialize the options.
	this.options = { cache: process.env.NODE_ENV === 'production', directory: 'views', extension: 'html', layout: null };
	// Initialize the templates.
	this.templates = {};
	// Initialize the parent directory.
	this.parentDirectory = path.dirname(parent.filename);
}

/**
 * Build all templates.
 *
 * @throws Throws an exception when a template is invalid.
 * @param directories The directories in which the builder currently resides.
 * @return The compiled template.
 */
Gaikan.prototype.build = function (directories) {
	// Initialize the directory path.
	var directoryPath = this.options.directory + (directories === undefined ? '' : '/' + directories.join('/'));
	// Initialize the response.
	var response = [];
	// Retrieve the files and directories.
	var files = fs.readdirSync(directoryPath);
	// Check if the directories array is undefined.
	if (directories === undefined) {
		// Initialize the directories array.
		directories = [];
	}
	// Iterate through each file and directory.
	for (var i = 0; i < files.length; i += 1) {
		// Retrieve the file path.
		var filePath = directoryPath + '/' + files[i];
		// Retrieve the statistics for the file path.
		var stats = fs.statSync(filePath);
		// Check if this is a file and check if it contains the extension.
		if (stats.isFile() && filePath.split('.').pop() === this.options.extension) {
			// Initialize a new instance of the Writer class.
			var writer = new Writer();
			// Split the file to prepare for the removal of the extension.
			var pieces = files[i].split('.');
			// Remove the extension.
			pieces.pop();
			// Push the template registration.
			response.push('gaikan.templates[\'' + ((directories.length === 0 ? '' : directories.join('/') + '/') + pieces.join('')).replace('\'', '\\\'') + '\']=function(e,v0,ip){');
			// Compile the template and push it to the build response.
			response.push(compiler(fs.readFileSync(filePath, 'utf8')));
			// Push the 
			response.push('};');
		}
		// Otherwise check if this is a directory.
		else if (stats.isDirectory()) {
			// Clone the directories to the local directories.
			var localDirectories = directories.slice(0);
			// Push the directory.
			localDirectories.push(files[i]);
			// Build all templates.
			response.push(this.build(localDirectories));
		}
	}
	// Return the response.
	return response.join('');
};

/**
 * Build all templates into a file.
 *
 * @throws Throws an exception when a path or template is invalid.
 * @param path The path to the build templates file.
 */
Gaikan.prototype.buildToPath = function (path) {
	// Build all templates and write to the path.
	fs.writeFileSync(path, this.build(), 'utf8');
};

/**
 * Compile a template.
 *
 * @throws Throws an exception when the template is invalid.
 * @param template The template.
 * @return The compiled template.
 */
Gaikan.prototype.compile = function (template) {
	// Compile the template and create a function.
	return new Function('e', 'v0', 'ip', compiler(template));
};

/**
 * Compile a template from a path.
 *
 * @throws Throws an exception when the path or template is invalid.
 * @param path The path to the template.
 * @return The compiled template.
 */
Gaikan.prototype.compileFromPath = function (path) {
	// Split the path to retrieve the file name.
	var fileName = path.split(/(\|\/)/).pop();
	// Split the file name to retrieve the file extension.
	var fileExtension = fileName.split('.').pop();
	// Check if the file name does not contain a file extension.
	if (fileName === fileExtension) {
		// Change the path to contain the file extension.
		path = path + '.' + this.options.extension;
	}
	// Check if the path is an absolute path.
	if (path.substr(0, this.parentDirectory.length) === this.parentDirectory) {
		// Change the path to be a relative path.
		path = path.substr(this.parentDirectory.length + 1);
	}
	// Check if the path does not point to the view directory.
	if (path.substr(0, this.options.directory.length) !== this.options.directory) {
		// Change the path to include the view directory.
		path = this.options.directory + '/' + path;
	}
	// Change the path to contain a valid directory path.
	path = path.replace('\\', '/');
	// Check if the options allow caching.
	if (this.options.cache) {
		// Check if the template has not been cached.
		if (!(path in this.templates)) {
			// Compile and cache the template.
			this.templates[path] = this.compile(fs.readFileSync(path, 'utf8'));
		}
		// Return the compiled template.
		return this.templates[path];
	}
	// Otherwise compile and return the template.
	else return this.compile(fs.readFileSync(path, 'utf8'));
};

/**
 * Render a template.
 *
 * @throws Throws an exception when the template is invalid.
 * @param template The template.
 * @param values The values to use when rendering.
 * @return The rendered template.
 */
Gaikan.prototype.render = function (template, values) {
	// Check if a layout has been configured.
	if (this.options.layout) {
		// Compile the template from the path and invoke it with a partial.
		return this.compile(this.options.layout)(this.engine, values, {
			// Define the content partial as the requested path.
			content: this.compileFromPath(path)
		});
	}
	// Compile the template and invoke it using a the current engine.
	return this.compile(template)(this.engine, values);
};

/**
 * Render a template from a path.
 *
 * @throws Throws an exception when the path or template is invalid.
 * @param path The path to the template.
 * @param values The values to use when rendering.
 * @return The rendered template.
 */
Gaikan.prototype.renderFromPath = function (path, values) {
	// Check if a layout has been configured.
	if (this.options.layout) {
		// Compile the template from the path and invoke it with a partial.
		return this.compileFromPath(this.options.layout)(this.engine, values, {
			// Define the content partial as the requested path.
			content: this.compileFromPath(path)
		});
	}
	// Compile the template from the path and invoke it using a the current engine.
	return this.compileFromPath(path)(this.engine, values);
};

// Check if module is defined.
if (typeof module !== undefined) {
	// Initialize a new instance of the Gaikan class and export it.
	module.exports = new Gaikan();
	// Add a function to the Gaikan class instance to support express view engines.
	module.exports.__express = function (path, options, fn) {
		// Retrieve the current cache option as previous cache.
		var previousCache = module.exports.options.cache;
		// Check if the options variable is a function.
		if (typeof options === 'function') {
			// Set the callback to the options.
			fn = options;
			// Initialize the options.
			options = {};
		}
		// Attempt the following code.
		try {
			// Set the cache option as instructed by express.
			module.exports.options.cache = options.cache;
			// Delete the cache.
			delete options.cache;
			// Delete the locals.
			delete options._locals;
			// Delete the settings.
			delete options.settings;
			// Render a template from a path.
			var rendered = module.exports.renderFromPath(path, options);
			// Restore the previous cache option.
			module.exports.options.cache = previousCache;
			// Send the rendered template.
			fn(null, rendered);
		}
		// Catch an error.
		catch (err) {
			// Restore the previous cache option.
			module.exports.options.cache = previousCache;
			// Send the error.
			fn(err);
		}
	};
}