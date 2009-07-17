/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.http.js');

/**
 * IMPORT DATA
 **/
importScripts('data.issues.db');

/**
 * REPORTER WORKER CONSTRUCTOR
 **/
function ReporterWorker() {
	this.issues = ISSUES;
}

/**
 * REPORTER WORKER PROTOTYPE
 **/
ReporterWorker.prototype = {
	process_fields: function(text, message) {
		var request = Request.factory.new_from_request_object(message.request);
		var response = Response.factory.new_from_response_object(message.response);
		
		return (new String(text)).replace(/\{issue\}/g, message.issue)
		                         .replace(/\{payload\}/g, message.payload)
		                         .replace(/\{request\}/g, request)
		                         .replace(/\{response\}/g, response)
		                         .replace(/\{url\}/g, request.url)
		                         .replace(/\{method\}/g, request.method)
		                         .replace(/\{hostname\}/g, request.hostname)
		                         .replace(/\{query\}/g, request.url.query)
		                         .replace(/\{request_data\}/g, request.data)
		                         .replace(/\{response_data\}/g, response.data)
		                         .replace(/\{request_headers\}/g, request.headers)
		                         .replace(/\{response_headers\}/g, response.headers)
		                         .replace(/\{date\}/g, (new Date()).toDateString())
		                         .replace(/\{sqli_database\}/g, message.database);
	},
	initiate: function (message) {
		if (message.message_type == 'FuzzerWorker.data') {
			var issue = this.issues[message.issue];
			
			if (issue) {
				var title = this.process_fields(issue.title, message);
				var description = this.process_fields(issue.description, message);
				
				this.post_message('ReporterWorker.data', {title:title, description:description, message:message});
			}
		}
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