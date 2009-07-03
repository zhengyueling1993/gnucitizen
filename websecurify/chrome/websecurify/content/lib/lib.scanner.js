/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.sets.js');
importScripts('lib.http.js');

/**
 * SCANNER WORKER CONSTRUCTOR
 **/
function ScannerWorker() {
	this.step = 0;
	this.steps = 0;
}

/**
 * SCANNER WORKER PROTOTYPE
 **/
ScannerWorker.prototype = {
	scan_methods: function (request) {
		// TODO: if it is actually possible without hacking xulrunner
	},
	scan_files: function (request) {
		// TODO:
	},
	scan_directories: function (request) {
		// TODO:
	},
	
	initiate: function (request) {
		var scanner_request = Request.factory.new_from_request_object(request);
		var scanner_methods = [];
		
		for (var scan_name in this) {
			if (scan_name.substring(0, 5) == 'scan_') {
				scanner_methods.push(scan_name);
			}
		}
		
		this.steps += scanner_methods.length;
		
		for (var i = 0; i < scanner_methods.length; i++) {
			this.post_progress('scanning for ' + scanner_methods[i]);
			
			this.step += 1;
			
			this[scanner_methods[i]](scanner_request);
			
			this.post_progress('finished scanning for ' + scanner_methods[i]);
		}
		
		this.post_message('ScannerWorker.finished');
	},
	post_progress: function (status) {
		var progress = (100 / this.steps) * this.step;
		var step = this.step + '/' + this.steps;
		
		this.post_message('ScannerWorker.progress', {progress:progress, step:step, status:status});
	},
	post_message: function (message_type, message) {
		var message = message;
		
		if (message == undefined) {
			var message = {};
		}
		
		message.message_type = message_type;
		postMessage(message);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/