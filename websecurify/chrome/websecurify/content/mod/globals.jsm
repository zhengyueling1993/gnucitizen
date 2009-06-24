/**
 * EXPORTED SYMBOLS
 **/
var EXPORTED_SYMBOLS = ['globals'];

/**
 * GLOBALS CONSTRUCTOR
 **/
function Globals() {
	// pass
}

/**
 * GLOBALS PROTOTYPE
 **/
Globals.prototype = {
	register: function (name, obj) {
		this[name] = obj;
	},
	unregister: function (name) {
		delete this[name];
	},
};

/**
 * GLOBALS
 **/
var globals = new Globals();