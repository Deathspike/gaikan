# Gaikan

HTML template engine for Node and Express.

## Installation

	$ npm install gaikan

## Features

	* Compiles templates to JavaScript supporting node and browsers.
	* Complies with W3C standards.
	* Complies with the [Express](http://expressjs.com) view system.
	* Friendly for non-programmers.
	* Includes/partials.
	* Iterators/conditions.
	* Variables.
	
## Planned Features

	* Express module to default to browser-rendering when available.
	* Iterator expansion through filters (i.e. sorting).

## API

The API is minimal.

	* build: Build all templates.
	* buildToPath(path): Build all templates into a file.
	* compile(template): Compile a template.
	* compileFromPath(path): Compile a template from a path.
	* render(template, values): Render a template.
	* renderFromPath(path, values): Render a template from a path.

## Configuration

Several configuration options are available in Gaikan.options.

	* cache: Indicates whether compiled templates are cached (Default: true).
	* directory: The direction from which templates are searched (Default: views).
	* extension: The default extension of a template (Default: html).
	* layout: The layout used for each render, containing a 'content' partial (Default: null).
	
## Express

Gaikan can be plugged into Express quite easily.

	// Set the extension for the view engine.
	app.set('view engine', 'html');
	// Register the Gaikan template engine.
	app.engine('html', require('Gaikan').__express);

The configuration has now changed behaviour.
	
	* cache: Ignored.
	* directory: Must match the directory specified by Express.
	* extension: Ignored, except when using build or buildToPath methods.

## Templates

### Includes/partials

A home template is going to be rendered into a master template.

	<!-- data-include includes a master template -->
	<ins data-include="master">
		<!-- This data-partial tells the master template we have a content partial defined -->
		<ins data-partial="content">
			Hello world!
		</ins>
	</ins>
	
Since I am including a master template, I need to make sure it is available.

	<html>
		<head>
			<title>Hello world!</title>
		</head>
		<body>
			<!-- This data-partial can be filled with content that is provided as a partial when including -->
			<div id="container" data-partial="content"></div>
		</body>
	</html>
	
When I render the home template, the following is generated.

	<html>
		<head>
			<title>Hello world!</title>
		</head>
		<body>
			<div id="container">
				Hello world!
			</div>
			<div id="copy">(C) Roel van Uden</div>
		</body>
	</html>

The *ins* element is removed. Writing master include statements is tedious and is simplified.

	// Include Gaikan.
	var Gaikan = require('gaikan');
	// Set the layout.
	Gaikan.options.layout = 'master';

The same behaviour is now applied to all templates.

### Iterators/conditions

Iterators allow you to repeat content for each item using the data-each attribute.

	<!-- This data-each ensures that the users are iterate through -->
	<ul data-each="users">
		<-- Use a variable to show the name of each user -->
		<li>#{name}</li>
	</ul>

The result is obvious.

	<ul>
		<li>Foo</li>
		<li>Bar</li>
	</ul>

You can also use a condition to show content depending on a circumstance.

	<ul data-each="users">
		<li data-if="name.length > 0">#{name}</li>
	</ul>

Since this is compiled to JavaScript, you can use JavaScript properties.

### Variables

Variables are used create dynamic content on the template.

	Hello #{name}, welcome back!
	
A variable can appear as non-escaped HTML, which uses an exclamation mark.

	Hello !{name}, welcome back!
	
It is also possible to add a handler to change the variable.

	Hello #{name|title}, welcome back!
	
Or you can use multiple handlers to change the variable.

	Hello <a href="/users/#{name|title,url}/">#{name|title}</a>, welcome back!
	
The default handlers are *escape*, *lower*, *nl2br*, *title*, *url* and *upper*. 