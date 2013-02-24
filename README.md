# Gaikan (1.3)

Gaikan is a HTML template engine for Node and Express. It allows compilation of HTML to JavaScript and provides a HTML-valid syntax to enable usage of conditions, iterators, includes, partials and variables. The template module was written to have a low entry barrier while accommodating any templating need with the highest achievable performance.

<a name="a1" />
## Installation

	$ npm install gaikan

<a name="a2"/>
## Features

	- Compiles HTML to JavaScript; low entry barrier.
	- Complies with W3C standards; designer friendly.
	- Complies with the Express view system.
	- Includes/partials; share markup between views.
	- Iterators/conditions; iterate, filter and write conditions.
	- Variables/handlers; use (conditional) variables and handlers.
	
<a name="a3"/>
## API

Direct usage of the API is not required when using [Express](#a4). The following API is available:

	compile(template, compress)
	    Compiles a template.
	compileFile(file, directory, cache, compress)
	    Compiles a template from file.
	explain(template, cb)
	    Explain a template using the compiled function.
	explainFile(file, directory, cb)
	    Explain a template from file using the compiled function.
	render(root, inputPartials, template)
	    Render a template.
	renderFile(root, inputPartials, file, directory, cache)
	    Render a template from file.

<a name="a4"/>
## Express

Support for Express has been made as painless as possible. Include the module:

	var gaikan = require('gaikan').

Configure the view engine:

	app.engine('html', gaikan);
	
Set the view engine extension:

	app.set('view engine', 'html');

<a name="a5"/>
## Options

The following options are available:

	cache     : Indicates whether templates compiled from file are cached.
	compress  : Indicates whether templates compiled from file are cached.
	directory : The default directory, or directories, used when compiling a template from file.
	extension : The default file extension used when compiling a template from file.
	layout    : The layout applied on templates rendered from file.
	partial   : The name of the partial used when applying the layout.
	scoped    : Indicates whether Express rendering is scoped to locals and options as partial.

The latter three options are handled in depth at [layouts](#a11) and [scoping](#a12).

<a name="a6"/>
## Attributes

The syntax uses **data-*** attributes for control flow features.

<a name="a7"/>
### Conditions

A condition is an if-statement on a HTML element using **data-if**. Use the following template:

	<div data-if="data.name">Name is set!</div>
	
The **data.name** indicates it uses the current data object with the name property. This is the representation:

	result += '<div>;
	if (data.name) result += 'Name is set!';
	result += '</div>';
	
When not using Express, this is how it would be rendered:

	gaikan.renderFile({name: 'Deathspike'}, null, 'template');

The second argument is for [partials](#a10), so use null. The result is the following:

	<div>Name is set!</div>
	
Conditions are JavaScript, so valid JavaScript is valid here. What if the name is undefined? The result is the following:

	<div></div>
	
The empty **div** element is there because it was declared. We can use the special element, **ins**, like this:

	<ins data-if="data.name">Name is set!</ins>

Using the **data-*** attributes, the **ins** element is interpreted as obsolete. This would result in:

	Name is set!
	
The special **ins** element is often useful for [includes](#a9).

<a name="a8"/>
### Iterators

An iterator is a for-statement on a HTML element using **data-in** or **data-for**. Use the following template:

	<ul data-in="data.users">
		<li>Someone is here.</li>
	</ul>
	
This is the representation:

	result += '<ul>';
	for (var key in data.users) {
		result += '<li>Someone is here.</li>';
	}
	result += '</ul>';

When not using Express, this is how it would be rendered:

	gaikan.renderFile({users: ['Deathspike']}, null, 'template');

The result is the following:

	<ul><li>Someone is here.</li></ul>

A for-in statement is not good for performance, so for an array **data-for** is much better:

	<ul data-for="data.users">
		<li>Someone is here.</li>
	</ul>

This is the representation:

	result += '<ul>';
	for (var key = 0, len = data.users.length; key < len; key++) {
		result += '<li>Someone is here.</li>';
	}
	result += '</ul>';
	
This becomes powerful when used together with [variables](#a13).

<a name="a9"/>
### Includes

Including allows a template to use another template using **data-include**. The following is **hello.html**:

	<b>Hello world!</b>
	
To demonstrate an inclusion, the following is **layout.html**:

	<div class="container" data-include="hello"></div>
	
When rendering **layout.html**, the output is as followed:

	<div class="container"><b>Hello world!</b></div>

The contents of **hello.html** are where they are supposed to be.

<a name="a10"/>
### Partials

Partials can be used to define and insert content using **data-partial**. The following is **hello.html**:

	<b><ins data-partial="content" /></b>
	
A placeholder has been defined. When including this file, it can be filled. The following is **layout.html**:

	<div class="container" data-include="hello">
	    <ins data-partial="content">
	        Hello world!
	    </ins>
	</div>

When rendering **layout.html**, the output is as followed:

	<div class="container"><b>Hello world!</b></div>

The result is similar, but note that **Hello world!** was defined in **layout.html** instead of **hello.html**.

<a name="a11"/>
### Layout

Includes and partials can be used to create a layout, but options make it easier. The following is **layout.html**:

	<div class="container" data-partial="content"></div>
	
The partial placeholder is named content, matching *options.partial*. The following is **hello.html**:

	<b>Hello world!</b>
	
There are no includes, instead we set *options.layout* to **'layout'**. The output is as followed:

	<div class="container"><b>Hello world!</b></div>

The **layout** options is very powerful, yet uses standard includes/partials to implement the feature.

<a name="a12"/>
### Scoping

Have you been wondering about what **data** really is? It changes depending on the scope. Use the following:

	<ul data-each="data.users">
		<li data-if="data">Someone is here.</li>
	</ul>

The condition is using the value from the **data.users** iteration. This is the representation:

	result += '<ul>';
	for (var key in data.users) {
		(function (parent, data) {
			result += '<li>Someone is here.</li>';
		})(data, data.users[key]);
	}
	result += '</ul>';

The contents of the iteration have been scoped. You can define scoping for **includes** or **partials** as followed:

	<div data-include="hello|data.contents">
	
Which can be interpreted as the following JavaScript:

	(function (data) {
		magicalGaikanInclude(data, 'hello'); // FYI, this function was made up.
	})(data.contents);

Scoping enables **key** (in iterations), **parent** (in iterations) and **root**. [Express](#a4) can be scoped as well:

	res.locals.value = 'Something';
	res.render('template', {value: 42});
	
The **locals** can be set anywhere, which is what we want for the **layout**. The following is desired:

	{value: 'Something', content: {value: 42}}
	
And can be achieved by enabling *options.scoped*. Remind yourself to adjust the scoping of the content partial as well.

<a name="a13"/>
## Variables

Variables are defined as either *#{x}* or *!{x}* and are used for content insertion. Use the following:

	<b>#{data.name}</b>
	
This is the representation:

	result += '<b>' + handlers.escape(data.name) + '</b>';

Something strange appeared, *handlers.escape*. That is because a **#** variable is **escaped**. Use the following:

	<b>!{data.name}</b>

Since is the **unescaped** variable, this is the following in JavaScript:

	result += '<b>' + data.name + '</b>';

An unescaped variable does allow HTML and is often undesirable. Variables can also use handlers as followed:

	#{data|lower}
	
This would change the variable to lower-case prior to escaping it. Handlers can be chained as followed:

	#{data|lower,upper}
	
Which would use both handlers. More information about handlers [can be found here](#a15).

<a name="a14"/>
### Performance

About 85% of performance loss is due to escaping. A solution is to pre-save escape content:

	var escape = require('gaikan/lib/handlers/escape-handler');
	var value = escape('<p>This is escaped</p>');
	
This value would result into the following escaped text for storage purposes:

	&#60;p&#62;This is escaped&#60;/p&#62;

This improves performance as escaping is done once, opposed to every render. The following can be used now:

	<b>!{data.content}</b>

However, it is possible that the variable is to be changed. It can be unescaped using a handler as followed:

	<textarea>!{data.content|unescape}</textarea>
	
Forgetting to escape a value makes you vulnerable to XSS. A different approach is presented in [a love story](#a16).

<a name="a15"/>
## Filters and Handlers

Handlers have been explained in [variables](#a13), however the following is also possible:

	<div data-if="handlers.upper(data.value)[0]"></div>

This is because each handler is a field in the handlers object. The following handlers are available:

	* escape: Escapes html to avoid html injection. Default behaviour when using #{var} instead of !{var}.
	* lower: Changes the value to lower case.
	* nl2br: Changes new lines to break elements. Great when using !{var|nl2br,escape} for text inputs.
	* title: Changes the value to title case.
	* unescape: Unescapes escaped html.
	* upper: Changes the value to upper case.
	* url: Escapes the value for use in an url.

Filters can be used to filter a value for iteration or for a condition.

	* isEmpty: Checks if the value is empty. Properties of objects are checked, or length of an array.
	* sort: Sorts the value. Can be used with reverse and a sorting key for objects in arrays.
	
An example of sort as followed:

	<div data-each="filters.sort(data.users)">
	
Sorting can be reversed as followed:

	<div data-each="filters.sort(data.users, true)">
	
Or when provided with an array of objects, based on a key, as followed:

	<div data-each="filters.sort(data.users, 'name')">
	
Or both, as shown below:

	<div data-each="filters.sort(data.users, true, 'name')">

Every filter and handle is accessible in every attribute or variable.

<a name="a16"/>
## A love story; AJAJ, Express and Gaikan

Gaikan release 1.4 implements the client-side rendering framework; a love story between AJAJ, Express and Gaikan.

<a name="a17"/>
## Conclusion

Gaikan was written by Roel "Deathspike" van Uden. If you have comments, questions or suggestions I would love to hear from you! To contact me, you can send me an e-mail. Thank you for your interest in the Gaikan HTML template engine for Node and Express.