/**
 *    lib.reporter.js
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

reporter = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('data.issues.db');
		
		load('lib.type.js');
		load('lib.http.js');
		load('lib.htmlparse.js');
	} catch (e) {
		importScripts('data.issues.db');
		
		importScripts('lib.type.js');
		importScripts('lib.http.js');
		importScripts('lib.htmlparse.js');
	}
	
	/**
	 * REPORTER CONSTRUCTOR
	 **/
	var Reporter = function () {
		this.issues = ISSUES;
	};

	/**
	 * REPORTER PROTOTYPE
	 **/
	Reporter.prototype = {
		// PROCESS FIELDS
		// processes auto fields
		process_fields: function(text, message) {
			var request = http.Request.factory.new_from_export(message.request);
			var response = http.Response.factory.new_from_export(message.response);

			return htmlparse.escape_entities((new String(text)).replace(/\{issue\}/g, message.issue)
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
			                                                   .replace(/\{sqli_database\}/g, message.database));
		},
		
		// INITIATE
		// starts reporting process
		initiate: function (message) {
			if (message.message_type == 'Fuzzer.data') {
				var issue = this.issues[message.issue];

				if (issue) {
					var title = this.process_fields(issue.title, message);
					var explanation = this.process_fields(issue.explanation, message);
					var description = this.process_fields(issue.description, message);

					this.post_message('Reporter.data', {title:title, explanation:explanation, description:description, message:message});
				}
			}
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
	// reporter namespace
	return {
		Reporter: Reporter};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/