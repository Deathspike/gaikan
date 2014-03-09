/*global ace, document, gaikan: false*/
'use strict';

function InteractiveGaikan(container) {
	this._container = container;
	this._editors = {
		template: this.create('templateEditor', 'html'),
		root: this.create('rootEditor', 'json'),
		compiled: this.create('compiledEditor', 'javascript', true),
		output: this.create('outputEditor', 'html', true)
	};
	this.update();
}

InteractiveGaikan.prototype.create = function (className, mode, isReadOnly) {
	var elements = document.getElementsByClassName(className);
	if (elements.length) {
		var editor = ace.edit(elements[0]);
		editor.setBehavioursEnabled(false);
		editor.getSession().setMode('ace/mode/' + mode);
		editor.renderer.setShowGutter(false);
		if (isReadOnly) {
			editor.setReadOnly(true);
			editor.setHighlightActiveLine(false);
			editor.renderer.$cursorLayer.element.style.opacity = 0;
		} else {
			editor.on('change', this.update.bind(this));
		}
		return editor;
	}
	return undefined;
};

InteractiveGaikan.prototype.update = function () {
	var compiled, root, output;
	
	// compile template
	try {
		compiled = gaikan.compileFromString(this._editors.template ?
			this._editors.template.getValue() :
			'');
		if (this._editors.compiled) {
			this._editors.compiled.setValue(compiled.toString(), -1);
		}
	} catch (e) {
		if (this._editors.compiled) {
			this._editors.compiled.setValue('ERROR: ' + e, -1);
		}
		if (this._editors.output) {
			this._editors.output.setValue('', -1);
		}
		return;
	}
	
	// parse json
	try {
		if (this._editors.root && this._editors.root.getValue()) {
			// Too bad correct objects can't be JSON.parse'd.
			eval('root = ' + this._editors.root.getValue() + ';');
		} else {
			root = undefined;
		}
	} catch (e) {
		if (this._editors.output) {
			this._editors.output.setValue('ERROR' + e, -1);
		}
		return;
	}
	
	// output
	try {
		output = compiled(gaikan, root);
		if (this._editors.output) {
			this._editors.output.setValue(output, -1);
		}
	} catch (e) {
		if (this._editors.output) {
			this._editors.output.setValue('ERROR' + e, -1);
		}
	}
};

var container = document.getElementById('test');
var interactive = new InteractiveGaikan(container);