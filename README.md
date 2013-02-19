# Gaikan

HTML template engine for Node and Express.

## Installation

	$ npm install gaikan

## Features

	* Compiles templates to JavaScript supporting node and browsers.
	* Complies with W3C standards.
	* Complies with the [Express](http://expressjs.com) view system.
	* Designer friendly; existing tooling will work with Gaikan.
	* Quick entry; Gaikan is easy! It is just HTML and JavaScript.
	* Includes/partials; share markup between views.
	* Iterators/conditions; iterate, filter and write conditions.
	* Variables/handlers; use (conditional) variables and handlers.
	
## Planned Features

	* Client-side component using client-side rendering.
	* Express component to transparently enable client-side rendering support.

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

	* cache: Indicates whether compiled templates are cached (Default: True when NODE_ENV is production).
	* directory: The direction from which templates are searched (Default: views).
	* extension: The default extension of a template (Default: html).
	* layout: The layout used for all rendering, containing a 'content' partial (Default: null).
	
## Express

Gaikan is easy to use with Express.

	// Include the Gaikan module.
	var Gaikan = require('Gaikan');
	// Set the Gaikan view engine.
	app.engine('html', Gaikan.__express);
	// Set the view engine extension.
	app.set('view engine', 'html');


## Templates

### Includes/partials

A home template is going to be rendered into a layout template.

	<ins data-include="layout">
		<ins data-partial="content">
			Hello world!
		</ins>
	</ins>
	
Since I am including a layout template, I need to make sure it is available.

	<html>
		<head>
			<title>Hello world!</title>
		</head>
		<body>
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
		</body>
	</html>

The *ins* element is removed. Writing layout include statements can be omitted by setting a layout.

	// Set the layout.
	Gaikan.options.layout = 'master';

Similar behaviour is now applied to all templates without includes.

### Variables/handlers

Variables are used add dynamic content to the view.

	Hello #{name}, welcome back!
	
A variable can appear as non-escaped HTML, which uses an exclamation mark.

	Hello !{name}, welcome back!
	
It is also possible to add a handler to change the variable.

	Hello #{name|title}, welcome back!
	
Or you can use multiple handlers to change the variable.

	Hello <a href="/users/#{name|title,url}/">#{name|title}</a>, welcome back!
	
### Iterators/conditions

These examples use the following object for the view.

	{users: [{name: 'Foo'}, {name: 'Bar'}, {name: ''}]}

Iterators allow you to repeat content for each item using the data-each attribute.
	
	<ul data-each="data.users">
		<li>#{data.name}</li>
	</ul>

The result is not perfect.

	<ul>
		<li>Foo</li>
		<li>Bar</li>
		<li></li>
	</ul>

One of the names is not valid. You can use a simple condition to remove it.

	<ul data-each="data.users">
		<li data-if="data.name.length">#{name}</li>
	</ul>

The result now has the invalid name removed.

	<ul>
		<li>Foo</li>
		<li>Bar</li>
	</ul>
	
This is better, but we want the names to be sorted alphabetically.

	<ul data-each="filters.sort(data.users, 'name')">
		<li data-if="data.name.length">#{name}</li>
	</ul>
	
The result is actually much better.

	<ul>
		<li>Bar</li>
		<li>Foo</li>
	</ul>
	
Conditions and iterators are just JavaScript. This is both familiar and powerful.

## Scoping

The scope changes when iterating and when using partials. The following fields are defined.

	* data: The active data. This changes when iterating and possibly when using partials.
	* key: The iteration key. This is set when iterating to the index of property name.
	* root: The root data. This is the input data provided to the template at all times.
	* parent: The parent data. The parent is defined when iterating.
	
As seen in the iterator examples, data is scoped to the active data. The following object is used.

	{count: 3, users: ['Foo', 'Bar']}

Now you could want to use a (n/total) notation. Use the following view.

	<ul data-each="data.users">
		<li>#{data} (#{key + 1}/#{parent.count})</li>
	</ul>

Note that the key was actually changed with some JavaScript! This gives the following result.

	<ul>
		<li>Foo (1/2)</li>
		<li>Bar (2/2)</li>
	</ul>
	
Again, this is all HTML and JavaScript. You could conditionally assign a class for highlighting purposes.

	<ul data-each="data.users">
		<li class="#{key % 2 == 1 ? 'highlight' : ''}">
			#{data} (#{key + 1}/#{parent.count})
		</li>
	</ul>
	
Which would result in the following.

	<ul>
		<li class="">Foo (1/2)</li>
		<li class="highlight">Bar (2/2)</li>
	</ul>
	
Partials and includes use the active data as their scope. You can change this behaviour like this.

	<div data-include="player|parent"></div>
	
Which changes the included template to use the parent instead of data as scope.

## Handlers

Each handler is a field in the handlers object. The following handlers are available.

	* html: Escapes html to avoid html injection. Default behaviour when using #{var} instead of !{var}.
	* lower: Changes the value to lower case.
	* nl2br: Changes new lines to break elements. Great when using !{var|nl2br,escape} for text inputs.
	* title: Changes the value to title case.
	* upper: Changes the value to upper case.
	* url: Escapes the value for use in an url.

An example escaping an url.

	<a href="#{data.address|url}">Go there now!</a>

## Filters

Filters can be used to filter a value for iteration or for a condition.

	* isEmpty: Checks if the value is empty. Properties of objects are checked, or length of an array.
	* sort: Sorts the value. Can be used with reverse and a sorting key for objects in arrays.
	
An example of sort.

	<div data-each="filters.sort(data.users)">
	
Sorting can be reversed.

	<div data-each="filters.sort(data.users, true)">
	
Or when provided with an array of objects, based on a key.

	<div data-each="filters.sort(data.users, 'name')">
	
Or both.

	<div data-each="filters.sort(data.users, true, 'name')">