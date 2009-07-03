/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.http.js');
importScripts('lib.sets.js');

/**
 * FUZZER WORKER CONSTRUCTOR
 **/
function FuzzerWorker() {
	this.step = 0;
	this.steps = 0;
	
	this.fuzzed_requests = new Set();
	this.xss_strings = ['<xss>'];
}

/**
 * FUZZER WORKER PROTOTYPE
 **/
FuzzerWorker.prototype = {
	initiate: function (request) {
		var fuzzed_request = Request.factory.new_from_request_object(request);
		var fuzzer_methods = [];
		
		for (var fuzz_name in this) {
			if (fuzz_name.substring(0, 5) == 'fuzz_') {
				fuzzer_methods.push(fuzz_name);
			}
		}
		
		this.steps += fuzzer_methods.length;
		
		for (var i = 0; i < fuzzer_methods.length; i++) {
			this.post_progress('fuzzing for ' + fuzzer_methods[i]);
			
			this.step += 1;
			
			this[fuzzer_methods[i]](fuzzed_request);
			
			this.post_progress('finished fuzzing for ' + fuzzer_methods[i]);
		}
		
		this.post_message('FuzzerWorker.finished');
	},
	fuzz_xss: function (fuzzed_request) {
		var query_keys = fuzzed_request.url.query.keys();
		
		for (var i in query_keys) {
			var key = query_keys[i];
			var request = new Request(fuzzed_request);
			
			for (var i = 0; i < this.xss_strings.length; i++) {
				request.url.query.set(key, new Raw(this.xss_strings[i]));
				this.test_xss(this.xss_strings[i], request);
			}
		}
		
		if (fuzzed_request.headers.get('Content-type') == 'application/x-www-form-urlencoded') {
			var query_data = new Query(fuzzed_request.data);
			var query_keys = query_data.keys();
			
			for (var i in query_keys) {
				var key = query_keys[i];
				
				var request = new Request(fuzzed_request);
				request.data = new Query(query_data);
				
				for (var i = 0; i < this.xss_strings.length; i++) {
					request.data.set(key, new Raw(this.xss_strings[i]));
					this.test_xss(this.xss_strings[i], request);
				}
			}
		}
	},
	test_xss: function (string, request) {
		if (this.fuzzed_requests.contains(request, false)) {
			return;
		}
		
		var regexpst = string.replace(/[.*+?|()\[\]{}\\]/g, '\\$&');
		var response = request.send();
		
		if ((new String(request.data)).match(new RegExp(regexpst))) {
			this.post_message('FuzzerWorker.data', {request:request, response:response, conclusion:'xss'});
		}
		
		this.fuzzed_requests.push(request);
	},
	fuzz_sqli: function (request) {
		// TODO: fuzz sqli
	},
	fuzz_crlfi: function (request) {
		// TODO: fuzz crfli
	},
	post_progress: function (status) {
		var progress = (100 / this.steps) * this.step;
		var step = this.step + '/' + this.steps;
		
		this.post_message('FuzzerWorker.progress', {progress:progress, step:step, status:status});
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