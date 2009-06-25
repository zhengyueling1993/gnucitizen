/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.http.js');

/**
 * FUZZER WORKER CONSTRUCTOR
 **/
function FuzzerWorker() {
	this.xss_strings = ['<xss>'];
}

/**
 * FUZZER WORKER PROTOTYPE
 **/
FuzzerWorker.prototype = {
	fuzz: function (request) {
		var fuzzed_request = new Request(request);
		
		for (var fuzz_name in this) {
			if (fuzz_name.substring(0, 5) == 'fuzz_') {
				this[fuzz_name](fuzzed_request);
			}
		}
	},
	fuzz_xss: function (fuzzed_request) {
		var query_keys = fuzzed_request.url.query.keys();
		
		for (var i in query_keys) {
			var key = query_keys[i];
			
			var request = new Request(fuzzed_request);
			
			for (var i = 0; i < this.xss_strings.length; i++) {
				request.url.query.set(key, this.xss_strings[i]);
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
					request.data.set(key, this.xss_strings[i]);
					this.test_xss(this.xss_strings[i], request);
				}
			}
		}
	},
	test_xss: function (string, request) {
		var response = request.send();
		
		if (response.data.match(/<xss>/)) {
			postMessage('testme');
		}
	},
	fuzz_sqli: function (request) {
		// pass
	},
	post_message: function (message_type, message) {
		message.message_type = message_type;
		postMessage(message);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/