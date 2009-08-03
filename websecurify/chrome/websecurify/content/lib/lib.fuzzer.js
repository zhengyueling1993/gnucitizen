/**
 *    lib.fuzzer.js
 *    Copyright (C) 2009  Petko D (pdp) Petkov (GNUCITIZEN)
 *    
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *   
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *   
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, write to the Free Software
 *   Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 **/

fuzzer = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('data.xss.db');
		load('data.sqli.db');
		
		load('lib.type.js');
		load('lib.http.js');
		load('lib.spider.js');
		load('lib.httpparse.js');
	} catch (e) {
		importScripts('data.xss.db');
		importScripts('data.sqli.db');
		
		importScripts('lib.type.js');
		importScripts('lib.http.js');
		importScripts('lib.spider.js');
		importScripts('lib.httpparse.js');
	}
	
	/**
	 * FUZZER CONSTRUCTOR
	 **/
	var Fuzzer = function () {
		this.step = 0;
		this.steps = 0;
		
		this.fuzzed_requests = new spider.Queue();
		
		this.xss_tests = XSS.tests;
		this.xss_payloads = XSS.payloads;
		
		this.sqli_tests = SQLI.tests;
		this.sqli_payloads = SQLI.payloads;
	};
	
	/**
	 * FUZZER PROTOTYPE
	 **/
	Fuzzer.prototype = {
		// ONMESSAGE
		// message event receiver
		onmessage: undefined,
		
		// GENERATE TEMPLATE REQUEST
		// generates a blanked-out (template) request
		generate_template_request: function (request) {
			var template_request = http.Request.factory.new_from_export(request);
			
			var query = {};
			var template_query = template_request.query;
			
			for (var property in template_query) {
				query[property] = '';
			}
			
			template_request.query = query;
			
			if (template_request.method == 'POST') {
				var template_content_type = template_request.headers['Content-type'];
				
				if (template_content_type == 'application/x-www-form-urlencoded' || template_content_type == 'multipart/form-data') {
					var query_data = {};
					var template_query_data = httpparse.parse_query(template_request.data);
					
					for (var property in template_query_data) {
						query_data[property] = '';
					}
					
					template_request.data = query_data;
				}
			}
			
			return template_request;
		},
		
		generate_parameter_fuzz: function (request, set) {
			var fuzz_requests = [];
			
			if (request.method == 'POST') {
				var content_type = request.headers['Content-type'];
				
				if (content_type == 'application/x-www-form-urlencoded' || content_type == 'multipart/form-data') {
					var data = httpparse.parse_query(request.data);
					
					for (var property in data) {
						for (key in set) {
							var fuzz_request = http.Request.factory.new_from_export(request);
							var fuzz_data = httpparse.parse_query(fuzz_request.data);

							fuzz_data[property] = set[key];
							fuzz_request.data = fuzz_data;

							fuzz_requests.push(fuzz_request);
						}
					}
				}
			}
			
			var query = request.query;
			
			for (var property in query) {
				for (key in set) {
					var fuzz_request = http.Request.factory.new_from_export(request);
					var fuzz_query = fuzz_request.query;
					
					fuzz_query[property] = set[key];
					fuzz_request.query = fuzz_query;
					
					fuzz_requests.push(fuzz_request);
				}
			}
			
			return fuzz_requests;
		},
		
		test_xss: function (request) {
			var response = request.send();
			var data = response.data;
			
			for (var i = 0; i < this.xss_tests.length; i++) {
				var test = this.xss_tests[i];
				
				if (data.match(new RegExp(test, 'i'))) {
					this.post_message('Fuzzer.data', {issue:'xss', request:request.export(), response:response.export()});
					
					return;
				}
			}
		},
		
		test_sqli: function (request) {
			var response = request.send();
			var data = response.data;
			
			for (var database in this.sqli_tests) {
				var tests = this.sqli_tests[database];
				
				for (var i = 0; i < tests.length; i++) {
					var test = tests[i];
					
					if (data.match(new RegExp(test, 'i'))) {
						this.post_message('Fuzzer.data', {issue:'sqli', database:database, request:request.export(), response:response.export()});
						
						return;
					}
				}
			}
		},
		
		fuzz_xss: function (request) {
			var fuzzed_requests = this.generate_parameter_fuzz(request, this.xss_payloads);
			
			for (var i = 0; i < fuzzed_requests.length; i++) {
				var fuzzed_request = fuzzed_requests[i];
				
				this.test_xss(fuzzed_request)
			}
		},
		
		fuzz_sqli: function (request) {
			var fuzzed_requests = this.generate_parameter_fuzz(request, this.sqli_payloads);
			
			for (var i = 0; i < fuzzed_requests.length; i++) {
				var fuzzed_request = fuzzed_requests[i];
				
				this.test_sqli(fuzzed_request)
			}
		},
		
		initiate: function (request) {
			var fuzzed_request = http.Request.factory.new_from_export(request);
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
				
				this.post_message('Fuzzer.finished');
			}
		},
		
		// POST PROGRESS
		// posts progress to parrent
		post_progress: function (status) {
			var progress = (100 / this.steps) * this.step;
			var step = this.step + '/' + this.steps;

			this.post_message('Fuzzer.progress', {progress:progress, step:step, status:status});
		},
		
		// POST MESSAGE
		// posts message to parrent
		post_message: function (message_type, message) {
			if (type.is_function(this.onmessage)) {
				var message = message;
				
				if (message == undefined) {
					var message = {};
				}
				
				message.message_type = message_type;
				
				this.onmessage(message);
			}
		},
	};
	
	// NAMESPACE
	// fuzzer namespace
	return {
		Fuzzer : Fuzzer};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/