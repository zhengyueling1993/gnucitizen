/**
 *    lib.spider.js
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

spider = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('lib.type.js');
		load('lib.html.js');
		load('lib.http.js');
		load('lib.httpparse.js');
	} catch (e) {
		importScripts('lib.type.js');
		importScripts('lib.html.js');
		importScripts('lib.http.js');
		importScripts('lib.httpparse.js');
	}
	
	/**
	 * QUEUE CONSTRUCTOR
	 **/
	var Queue = function () {
		this.index = 0;
		this.values = [];
	};
	
	/**
	 * QUEUE PROTOTYPE
	 **/
	Queue.prototype = {
		// LENGTH GETTER
		// get the length of the queue
		get length() {
			return this.values.length;
		},
		
		// CONTAINS
		// checks whether a value exists in the queue
		contains: function (value) {
			return this.values.some(function (element) {
				return value.valueOf() == element.valueOf();
			});
		},
		
		// PUSH
		// push a value in the queue
		push: function (value) {
			if (!this.contains(value)) {
				this.values.push(value);
				
				return true;
			}
			
			return false;
		},
		
		// NEXT
		// get the next value based on the queue's current index
		next: function () {
			if (this.index < this.values.length) {
				return this.values[this.index++];
			}
		},
	};
	
	/**
	 * SCOPE CONSTRUCTOR
	 **/
	var Scope = function (scope) {
		this.include = [];
		this.exclude = [];
		
		if (scope != undefined) {
			if (type.is_array[scope.include]) {
				this.include = scope.include;
			} else {
				this.include = scope.include ? [scope.include.toString()] : [];
			}
			
			if (type.is_array[scope.exclude]) {
				this.exclude = scope.exclude;
			} else {
				this.exclude = scope.exclude ? [scope.exclude.toString()] : [];
			}
		}
	};
	
	/**
	 * SCOPE PROTOTYPE
	 **/
	Scope.prototype = {
		// INCLUDE REQUEST
		// include request from scope
		include_request: function (request) {
			this.include.push('^' + request.url.toString().replace(new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g'), '\\$&'));
		},
		
		// EXCLUDE REQUEST
		// exclude request from scope
		exclude_request: function (request) {
			this.exclude.push('^' + request.url.toString().replace(new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g'), '\\$&'));
		},
		
		// MATCH
		// match request against scope
		match: function (request) {
			for (var i = 0; i < this.include.length; i++) {
				if ((new RegExp(this.include[i], 'i')).exec(request.url)) {
					for (var z = 0; z < this.exclude.length; z++) {
						if ((new RegExp(this.exclude[z], 'i')).exec(request.url)) {
							return false;
						}
					}
					
					return true;
				}
			}
			
			if (this.include.length > 0) {
				return false;
			}
			
			for (var z = 0; z < this.exclude.length; z++) {
				if ((new RegExp(this.exclude[z], 'i')).exec(request.url)) {
					return false;
				}
			}
			
			return true;
		},
	};
	
	/**
	 * SPIDER CONSTRUCTOR
	 **/
	var Spider = function () {
		this.step = 0;
		this.available = true;
		
		this.queue = new Queue();
		this.scope = new Scope();
	};
	
	/**
	 * SPIDER PROTOTYPE
	 **/
	Spider.prototype = {
		// ONMESSAGE
		// message event receiver
		onmessage: undefined,
		
		// CREATE SCOPE
		// wipes the current scope and creates a new one
		create_scope: function (scope) {
			this.scope = new Scope(scope);
		},
		
		// UPDATE SCOPE
		// only update the current scope
		update_scope: function (scope) {
			this.scope.update(scope);
		},
		
		// INITIATE
		// initiate spider worker with exported request object
		initiate: function (request) {
			var request = http.Request.factory.new_from_export(request);
			
			this.scope.include_request(request);
			this.queue.push(request, false);
			
			this.process();
		},
		
		// PROCESS
		// process requests in the request queue, i.e. spidering
		process: function () {
			while (true) {
				var request = this.queue.next();
				
				if (!request) {
					this.post_message('Spider.finished');
					
					break;
				}
				
				this.post_progress('spidering for ' + request.method + ' ' + request.url);
				
				var response = request.send();
				
				var document = new html.Document(response.data, request.url);
				
				var links = document.links;
				
				for (var i = 0; i < links.length; i++) {
					var link = links[i];
					
					var request_to_spider = http.Request.factory.new_get_request(link.split('#')[0]);
					
					if (this.scope.match(request_to_spider)) {
						this.queue.push(request_to_spider);
					}
				}
				
				var actions = document.actions;
				
				for (var i = 0; i < actions.length; i++) {
					var action = actions[i];
					
					var method = action.method;
					var headers = action.headers;
					var data = action.data;
					
					var parameters = {};
					
					for (parameter_name in action.parameters) {
						if (parameter_name.match(/name/i)) {
							parameters[parameter_name] = 'Fred';
						} else
						if (parameter_name.match(/user/i)) {
							parameters[parameter_name] = 'fred';
						} else
						if (parameter_name.match(/pass/i)) {
							parameters[parameter_name] = 'Fr3d1ee!';
						} else
						if (parameter_name.match(/email/i)) {
							parameters[parameter_name] = 'fred@websecurify.com';
						} else
						if (parameter_name.match(/url|blog/i)) {
							parameters[parameter_name] = 'http://www.websecurify.com';
						} else {
							parameters[parameter_name] = '123';
						}
					}
					
					if (method == 'GET') {
						var url_parts = httpparse.polish_url(httpparse.parse_url(action.url));
						url_parts.query = httpparse.build_query(parameters);
						
						var url = httpparse.build_url(url_parts);
						
						var data = {};
					} else {
						var url = action.url;
						
						var data = parameters;
					}
					
					var request_to_spider = http.Request.factory.new_request(method, url, headers, data);
					
					if (this.scope.match(request_to_spider)) {
						this.queue.push(request_to_spider);
					}
				}
				
				this.step += 1;
				
				this.post_message('Spider.data', {request:request.export(), response:response.export(), links:links});
				this.post_progress('finished spidering for ' + request.url + ' (' + request.method + ')');
			}
		},
		
		// POST PROGRESS
		// post progress to worker parrent
		post_progress: function (status) {
			var progress = (100 / this.queue.length) * this.step;
			var step = this.step + '/' + this.queue.length;
			
			this.post_message('Spider.progress', {progress:progress, step:step, status:status});
		},
		
		// POST MESSAGE
		// post message to worker parrent
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
	// spider namespace
	return {
		Queue  : Queue,
		Scope  : Scope,
		Spider : Spider};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/