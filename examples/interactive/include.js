
/*jslint browser: true, nomen: true, evil: true*/
/*global ace, gaikan*/
(function () {
	// Enable restricted mode.
	'use strict';

	function InteractiveGaikan(container) {
		// Set the container.
		this._container = container;
		// Set each editor ...
		this._editors = {
			// ... with the template editor ...
			template: this.create('templateEditor', 'html'),
			// ... with the root editor ...
			root: this.create('rootEditor', 'json'),
			// ... with the compiled function editor ...
			compiled: this.create('compiledEditor', 'javascript', true),
			// ... with the output editor.
			output: this.create('outputEditor', 'html', true)
		};
		// Update each interactive editor.
		this.update();
	}

	InteractiveGaikan.prototype.create = function (id, mode, isReadOnly) {
		var element = document.getElementById(id),
			editor;
		if (element) {
			editor = ace.edit(element);
			editor.setBehavioursEnabled(false);
			editor.getSession().setMode('ace/mode/' + mode);
			// Set the gutter to be disabled.
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
					this._editors.template.getValue() : '');
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
				// Too bad correct JS objects can't be JSON.parse'd.
				eval('root = ' + this._editors.root.getValue() + ';');
			} else {
				root = undefined;
			}
		} catch (jsonError) {
			if (this._editors.output) {
				this._editors.output.setValue('ERROR' + jsonError, -1);
			}
			return;
		}

		// output
		try {
			output = compiled(gaikan, root);
			if (this._editors.output) {
				this._editors.output.setValue(output, -1);
			}
		} catch (outputError) {
			if (this._editors.output) {
				this._editors.output.setValue('ERROR' + outputError, -1);
			}
		}
	};

	var container = document.getElementById('test'),
		interactive = new InteractiveGaikan(container);
}());