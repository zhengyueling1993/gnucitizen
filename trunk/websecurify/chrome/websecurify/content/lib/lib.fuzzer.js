/**
 * IMPORT SCRIPTS
 **/
importScripts('api.fuzzer.js');

/**
 * FUZZER PROCESSOR CONSTRUCTOR
 **/
function FuzzerProcessor() {
	// pass
}

/**
 * FUZZER PROCESSOR PROTOTYPE
 **/
FuzzerProcessor.prototype = {
	process: function (request) {
		// pass
	},
	post_message: function (message_type, message) {
		message.message_type = message_type;
		postMessage(message);
	},
	forward_message: function (message) {
		postMessage(message);
	},
};

/**
 * FUZZER CONSTRUCTOR
 **/
function Fuzzer() {
	this.processors = [];
}

/**
 * FUZZER PROTOTYPE
 **/
Fuzzer.prototype = {
	fuzz: function (request) {
		var fuzzed_request = request;
	},
	post_message: function (message_type, message) {
		message.message_type = message_type;
		postMessage(message);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/