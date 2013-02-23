/**
 * Module dependencies.
 */
var fs = require('fs'),
	inProduction = process.env.NODE_ENV === 'production',
	parser = require('./parser'),
	path = require('path'),
	runtime = require('./runtime'),
	templates = {};

/**
 * Render a template from file using Express notation.
 *
 * @param path The path.
 * @param options The options.
 * @param cb The callback.
 */
module.exports = function (path, options, cb) {
	// Check if the options variable is a function.
	if (typeof options === 'function') {
		// Set the callback to the options.
		cb = options;
		// Initialize the options.
		options = {};
	}
	// Attempt the following code.
	try {
		// Retrieve the cache.
		var cache = options.cache;
		// Retrieve the locals.
		var locals = options._locals;
		// Delete the cache.
		delete options.cache;
		// Delete the locals.
		delete options._locals;
		// Delete the settings.
		delete options.settings;
		// Check if express rendering is scoped to locals and options as partial.
		if (module.exports.options.scoped) {
			// Set the options as partial.
			locals[module.exports.options.partial] = options;
			// Set the options.
			options = locals;
		}
		// Render a template from file and invoke the callback.
		cb(null, module.exports.renderFile(options, null, path, null, cache));
	}
	// Catch an error.
	catch (err) {
		// Invoke the callback.
		cb(err);
	}
};

/**
 * Compile a template.
 *
 * @param template The template.
 * @param compress Indicates whether compression has been enabled.
 * @return The compiled template.
 */
module.exports.compile = function (template, compress) {
	// Validate and set compression.
	compress = compress === undefined ? module.exports.options.compress : compress;
	// CHeck if the render function of runtime is invalid.
	if (!runtime.render) {
		// Set the runtime render function.
		runtime.render = function (root, inputPartials, file) {
			// Compile, render and return a template from file.
			return module.exports.compileFile(file)(root, inputPartials);
		};
	}
	// Return the invoked parser scope.
	return (function () {
		// Parse a template and compile it.
		var compiled = new Function('runtime', 'root', 'inputPartials', parser(template, compress));
		// Return the wrapped function.
		return function (root, inputPartials) {
			// Execute the template.
			return compiled(runtime, root, inputPartials);
		};
	})();
};

/**
 * Compile a template from file.
 *
 * @param file The file.
 * @param directory The optional directory.
 * @param cache The optional cache.
 * @param compress Indicates whether compression has been enabled.
 * @returns The compiled template.
 */
module.exports.compileFile = function (file, directory, cache, compress) {
	// Validate and set the cache.
	cache = cache === undefined ? module.exports.options.cache : cache;
	// Validate and set compression.
	compress = compress === undefined ? module.exports.options.compress : compress;
	// Validate and set the directory.
	directory = directory === undefined ? module.exports.options.directory : (Array.isArray(directory) ? directory : [directory]);
	// Validate and set the file name.
	file = path.extname(file).length ? file : file + '.' + module.exports.options.extension;
	// Iterate through each directory.
	for (var i = 0; i < directory.length; i += 1) {
		// Initialize the name.
		var name = directory[i] + file;
		// Check if cache is enabled and the template is cached.
		if (cache && templates[name]) {
			// Return the compiled template from cache.
			return templates[name];
		}
		// Check if the template exists.
		if (!(name in templates) && fs.existsSync(path.join(directory[i], file))) {
			// Compile the template.
			var compiled = module.exports.compile(fs.readFileSync(path.join(directory[i], file), 'utf8'), compress);
			// Check if the cache is enabled.
			if (cache) {
				// Cache the compiled template.
				templates[name] = compiled;
			}
			// Return the compiled template.
			return compiled;
		}
		// Invalidate the template to avoid checking again in the future.
		templates[name] = null;
	}
	// Throw an error when the file has not been found.
	throw Error('Invalid template file "' + file + '"');
};

/**
 * Explain a template using the compiled function.
 *
 * @param template The template.
 * @param cb The optional callback, or console.log.
 */
module.exports.explain = function (template, cb) {
	// Validate and set the callback
	cb = cb === undefined ? console.log : cb;
	// Parse a template and prepare it with a function wrapper.
	cb('function (runtime, root, inputPartials) {' + '\n' + parser(template, true) + '\n' + '}');
}

/**
 * Explain a template from file using the compiled function.
 *
 * @param file The file.
 * @param directory The optional directory.
 * @param cb The optional callback, or console.log.
 */
module.exports.explainFile = function (file, directory, cb) {
	// Check if the directory is a function.
	if (typeof directory === 'function') {
		// Set the callback.
		cb = directory;
		// Remove the directory.
		directory = undefined;
	}
	// Validate and set the callback
	cb = cb === undefined ? console.log : cb;
	// Validate and set the directory.
	directory = directory === undefined ? module.exports.options.directory : (Array.isArray(directory) ? directory : [directory]);
	// Validate and set the file name.
	file = path.extname(file).length ? file : file + '.' + module.exports.options.extension;
	// Iterate through each directory.
	for (var i = 0; i < directory.length; i += 1) {
		// Check if the template exists.
		if (fs.existsSync(path.join(directory[i], file))) {
			// Parse a template and prepare it with a function wrapper.
			cb('function (runtime, root, inputPartials) {' + '\n' + parser(fs.readFileSync(path.join(directory[i], file), 'utf8'), true) + '\n' + '}');
			// Return.
			return;
		}
	}
}

/**
 * The options.
 */
module.exports.options = {
	// Indicates whether templates compiled from file are cached.
	cache: inProduction,
	// Indicates whether templates are compressed prior to compilation.
	compress: inProduction,
	// The default directory, or directories, used when compiling a template from file.
	directory: ['views'],
	// The default file extension used when compiling a template from file.
	extension: 'html',
	// The layout applied on templates rendered from file.
	layout: null,
	// The name of the partial used when applying the layout.
	partial: 'content',
	// Indicates whether express rendering is scoped to locals and options as partial.
	scoped: false
};

/**
 * Render a template.
 *
 * @param root The root data.
 * @param inputPartials The input partials.
 * @param template The template.
 * @returns The rendered template.
 */
module.exports.render = function (root, inputPartials, template) {
	// Compile a template, invoke it and return the results.
	return module.exports.compile(template)(root, inputPartials)
};

/**
 * Render a template from file.
 *
 * @param root The root data.
 * @param inputPartials The input partials.
 * @param file The file.
 * @param directory The optional directory.
 * @param cache The optional cache.
 * @returns The rendered template.
 */
module.exports.renderFile = function (root, inputPartials, file, directory, cache) {
	// Compile a template from file.
	var compiled = module.exports.compileFile(file, directory, cache);
	// Check if a layout has been configured.
	if (module.exports.options.layout) {
		// Initialize the input partials for the layout.
		var layoutInputPartials = {};
		// Add the template partial to the input partials for the layout.
		layoutInputPartials[module.exports.options.partial] = function (root) {
			// Invoke the compiled template with the input partials.
			return compiled(root, inputPartials);
		};
		// Compile and return the layout using the template as partial.
		return module.exports.compileFile(module.exports.options.layout)(root, layoutInputPartials);
	}
	// Invoke the compiled template.
	return compiled(root);
};