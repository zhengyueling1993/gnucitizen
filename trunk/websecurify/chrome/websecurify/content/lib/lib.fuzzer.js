/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.http.js');
importScripts('lib.spider.js');

/**
 * IMPORT DATA
 **/
importScripts('data.xss.db');
importScripts('data.sqli.db');

/**
 * FUZZER WORKER CONSTRUCTOR
 **/
function FuzzerWorker() {
	this.step = 0;
	this.steps = 0;
	
	this.fuzzed_requests = new Queue();
	
	this.xss_tests = XSS.tests;
	this.xss_payloads = XSS.payloads;
	
	this.sqli_tests = SQLI.tests;
	this.sqli_payloads = SQLI.payloads;
}

/**
 * FUZZER WORKER PROTOTYPE
 **/
FuzzerWorker.prototype = {
	generate_template_request: function (request) {
		var template_request = new Request(request);
		
		var parameters = template_request.url.query.keys();
		
		for (var x = 0; x < parameters.length; x++) {
			var parameter = parameters[x];
			
			template_request.url.query.set(parameter, '');
		}
		dump(template_request.headers + '\n');
		if (request.headers.get('Content-type') == 'application/x-www-form-urlencoded') {
			var data = new Query(request.data);
			var parameters = data.keys();
			
			for (var x = 0; x < parameters.length; x++) {
				var parameter = parameters[x];
				
				data.set(parameter, '');
			}
			
			request.data = data;
		}
		
		return template_request;
	},
	generate_parameter_fuzz: function (request, set) {
		var fuzzed_requests = [];
		
		var parameters = request.url.query.keys();
		
		for (var x = 0; x < parameters.length; x++) {
			var parameter = parameters[x];
			
			for (var y = 0; y < set.length; y++) {
				var value = request.url.query.get(parameter);
				var payloads = [set[y], value + set[y], set[y] + value];
				
				for (var z = 0; z < payloads.length; z++) {
					var payload = payloads[z];
					
					var fuzzed_request = new Request(request);
					fuzzed_request.url.query.set(parameter, new Raw(payload));
					
					fuzzed_requests.push(fuzzed_request);
				}
			}
		}
		
		return fuzzed_requests;
	},
	test_xss: function (request) {
		var response = request.send();
		var data = new String(response.data);
		
		for (var i = 0; i < this.xss_tests.length; i++) {
			var test = this.xss_tests[i];
			
			if (data.match(new RegExp(test, 'i'))) {
				this.post_message('FuzzerWorker.data', {issue:'xss', request:request, response:response});
				
				return true;
			}
		}
		
		return false;
	},
	test_sqli: function (request) {
		var response = request.send();
		var data = new String(response.data);
		
		for (var database in this.sqli_tests) {
			var tests = this.sqli_tests[database];
			
			for (var i = 0; i < tests.length; i++) {
				var test = tests[i];
				
				if (data.match(new RegExp(test, 'i'))) {
					this.post_message('FuzzerWorker.data', {issue:'sqli', database:database, request:request, response:response});
					
					return true;
				}
			}
		}
		
		return false;
	},
	fuzz_xss: function (request) {
		var fuzzed_requests = this.generate_parameter_fuzz(request, this.xss_payloads);
	
		for (var i = 0; i < fuzzed_requests.length; i++) {
			var fuzzed_request = fuzzed_requests[i];
			
			this.test_xss(fuzzed_request);
		}
	},
	fuzz_sqli: function (request) {
		var fuzzed_requests = this.generate_parameter_fuzz(request, this.sqli_payloads);
	
		for (var i = 0; i < fuzzed_requests.length; i++) {
			var fuzzed_request = fuzzed_requests[i];
			
			this.text_sqli(fuzzed_request);
		}
	},
	initiate: function (request) {
		var fuzzed_request = Request.factory.new_from_request_object(request);
		var fuzzer_methods = [];
		
		var template_request = this.generate_template_request(request);
		var exists = !this.fuzzed_requests.push(template_request);
		
		if (!exists) {
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
		}
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