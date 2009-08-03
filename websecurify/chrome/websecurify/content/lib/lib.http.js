/**
 *    lib.http.js v0.1
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

http = (function () {
	// IMPORTS
	// code dependencies
	try {
		load('lib.type.js');
		load('lib.httpparse.js');
	} catch (e) {
		importScripts('lib.type.js');
		importScripts('lib.httpparse.js');
	}
	
	// EXTEND
	// extends objecta with the content of objectb
	var extend = function (objecta, objectb) {
		for (var property in objectb) {
			objecta[property] = objectb[property];
		}
		
		return objecta;
	};
	
	/**
	 * RESPONSE CONSTRUCTOR
	 **/
	var Response = function (parts) {
		this.parts = parts;
	}
	
	/**
	 * RESPONSE PROTOTYPE
	 **/
	Response.prototype = {
		// CODE GETTER
		// gets validated and normalized code
		get code() {
			if (type.is_number(this.parts.code)) {
				return this.parts.code;
			} else
			if (type.is_string(this.parts.code)) {
				return parseInt(this.parts.code.toString(), 10);
			} else {
				return undefined;
			}
		},
		
		// CODE SETTER
		// sets validated and normalized code
		set code(value) {
			if (type.is_number(value)) {
				this.parts.code = value;
			} else
			if (type.is_string(value)) {
				this.parts.code = parseInt(value.toString(), 10);
			} else {
				this.parts.code = undefined;
			}
		},
		
		get message() {
			return this.parts.message ? this.parts.message : undefined;
		},
		
		set message(value) {
			this.parts.message = value.toString();
		},
		
		// HEADERS GETTER
		// gets validated and normalized headers
		get headers() {
			if (type.is_string(this.parts.headers)) {
				return httpparse.parse_headers(this.parts.headers);
			} else {
				return extend({}, this.parts.headers);
			}
		},
		
		// HEADERS SETTER
		// sets a validated and normalized headers
		set headers(value) {
			if (type.is_string(value)) {
				this.parts.headers = value.toString();
			} else {
				this.parts.headers = httpparse.build_headers(value);
			}
		},
		
		// DATA GETTER
		// gets validated and normalized data
		get data() {
			if (type.is_string(this.parts.data)) {
				return this.parts.data.toString();
			} else {
				return httpparse.build_query(this.parts.data);
			}
		},
		
		// DATA SETTER
		// sets validated and normalized data
		set data(value) {
			if (type.is_string(value)) {
				this.parts.data = value.toString();
			} else {
				this.parts.data = httpparse.build_query(value);
			}
		},
		
		// EXPORT
		// exports internal parts
		export: function () {
			return this.parts;
		},
		
		// IMPORT
		// imports internal parts
		import: function (parts) {
			extend(this.parts, parts);
		},
		
		// TOSTRING
		// calculates the string representation of response
		toString: function () {
			return httpparse.build_response(this);
		},
		
		// VALUEOF
		// calculates the value representation of response
		valueOf: function () {
			return this.toString();
		},
	};
	
	/**
	 * RESPONSE FACTORY
	 **/
	Response.factory = {
		// NEW RESPONSE
		// factory method for creating new responses
		new_response: function (code, message, headers, data) {
			return new Request({code:code, message:message, headers:(headers ? headers : {}), data:(data ? data : '')});
		},
		
		// NEW RESPONSE FROM URL
		// factory method for creating new responses from url
		new_response_from_url: function (url) {
			return this.new_response_from_request(Request.factory.new_get_request(url));
		},
		
		// NEW RESPONSE FROM REQUEST
		// factory method for creating new responses from requests
		new_response_from_request: function (request) {
			return request.send();
		},
		
		// NEW FROM EXPORT
		// factory method for creating new response from exported response parts
		new_from_export: function (object) {
			var response = new Response({});
			response.import(object);
			
			return response;
		},
	};
	
	/**
	 * REQUEST CONSTRUCTOR
	 **/
	var Request = function (parts) {
		this.parts = parts;
	};
	
	// REQUEST PROTOTYPE
	Request.prototype = {
		// METHOD GETTER
		// gets a validated and normalized request method
		get method() {
			return this.parts.method ? this.parts.method.toString().toUpperCase() : 'GET';
		},
		
		// METHOD SETTER
		// sets a validated and nromalized request method
		set method(value) {
			this.parts.method = value ? value.toString().toUpperCase() : 'GET';
		},
		
		// URL GETTER
		// gets a validated and normalized url from internal parts
		get url() {
			return httpparse.build_url(httpparse.polish_url(this.parts));
		},
		
		// URL SETTER
		// sets internal parts from validated and normalized url
		set url(value) {
			var parts = httpparse.polish_url(httpparse.parse_url(value));

			extend(this.parts, parts);
		},
		
		// PROTOCOL GETTER
		// gets a validated and normalized url protocol
		get protocol() {
			return this.parts.protocol ? this.parts.protocol.toString().toLowerCase() : 'http';
		},
		
		// PROTOCOL SETTER
		// sets a validated and normalized url protocol
		set protocol(value) {
			this.parts.protocol = value.toString().toLowerCase();
		},
		
		// USERNAME GETTER
		// gets a validated and normalized url username
		get username() {
			return this.parts.username ? this.parts.username.toString() : undefined;
		},
		
		// USERNAME SETTER
		// sets a validated and normalized url username
		set username(value) {
			this.parts.username = value.toString();
		},
		
		// PASSWORD GETTER
		// gets a validated and normalized url password
		get password() {
			return this.parts.password ? this.parts.password.toString() : undefined;
		},
		
		// PASSWORD SETTER
		// sets a validated and normalized url password
		set password(value) {
			this.parts.password = value.toString();
		},
		
		// HOSTNAME GETTER
		// gets a validated and normalized url hostname
		get hostname() {
			return this.parts.hostname ? this.parts.hostname.toString() : 'localhost';
		},
		
		// HOSTNAME SETTER
		// sets a validated and normalized url hostname
		set hostname(value) {
			this.parts.hostname = value.toString();
		},
		
		// PORT GETTER
		// gets a validated and normalized url port
		get port() {
			if (type.is_number(this.parts.port)) {
				return this.parts.port >= 0 ? this.parts.port : undefined;
			} else
			if (type.is_string(this.parts.port)) {
				var port = parseInt(this.parts.port, 10);
				return this.parts.port >=0 ? this.parts.port : undefined;
			} else {
				switch (self.protocol) {
					case 'ftp'  : return 21;
					case 'http' : return 80;
					case 'https': return 443;
					default     : return 0;
				};
			}
		},
		
		// PORT SETTER
		// sets a validated and normalized url port
		set port(value) {
			if (is_number(value)) {
				this.parts.port  = value >= 0 ? value : undefined;
			} else
			if (is_string(value)) {
				try {
					var port = parseInt(value.toString(), 10);
					this.parts.port  = value >= 0 ? value : undefined;
				} catch (e) {
					this.parts.port = undefined;
				}
			} else {
				switch (this.protocol) {
					case 'ftp'  : this.parts.port = 21       ; break;
					case 'http' : this.parts.port = 80       ; break;
					case 'https': this.parts.port = 443      ; break;
					default     : this.parts.port = undefined; break;
				};
			}
		},
		
		// PATHNAME GETTER
		// gets a validated and normalized pathname
		get pathname() {
			return httpparse.polish_pathname(this.parts.pathname.toString().replace(/^\/?/, '/'));
		},
		
		// PATHNAME SETTER
		// sets a validated and normalized pathname
		set pathname(value) {
			this.parts.pathname = httpparse.polish_pathname(value.toString().replace(/^\/?/, '/'));
		},
		
		// QUERY GETTER
		// gets a validated and normalized query
		get query() {
			if (type.is_string(this.parts.query)) {
				return httpparse.parse_query(this.parts.query);
			} else {
				return extend({}, this.parts.query);
			}
		},
		
		// QUERY SETTER
		// sets a validated and normalized query
		set query(value) {
			if (type.is_string(value)) {
				this.parts.query = value.toString();
			} else {
				this.parts.query = httpparse.build_query(value);
			}
		},
		
		// PATHINFO GETTER
		// gets a validated and normalized pathinfo
		get pathinfo() {
			return this.pathname + (this.query ? '?' + httpparse.build_query(this.query) : '');
		},
		
		// PATHINFO SETTER
		// sets a validated and normalized pathinfo
		set pathinfo(value) {
			var url = 'http://dummy' + httpparse.polish_pathname(value.toString().replace(/^\/?/, '/'));
			var parts = httpparse.polish_url(httpparse.parse_url(url));
			
			this.pathname = parts.pathname;
			this.query = parts.query;
		},
		
		// HEADERS GETTER
		// gets validated and normalized headers
		get headers() {
			if (type.is_string(this.parts.headers)) {
				return httpparse.parse_headers(this.parts.headers);
			} else {
				return extend({}, this.parts.headers);
			}
		},
		
		// HEADERS SETTER
		// sets a validated and normalized headers
		set headers(value) {
			if (type.is_string(value)) {
				this.parts.headers = value.toString();
			} else {
				this.parts.headers = httpparse.build_headers(value);
			}
		},
		
		// DATA GETTER
		// gets validated and normalized data
		get data() {
			if (type.is_string(this.parts.data)) {
				return this.parts.data.toString();
			} else {
				return httpparse.build_query(this.parts.data);
			}
		},
		
		// DATA SETTER
		// sets validated and normalized data
		set data(value) {
			if (type.is_string(value)) {
				this.parts.data = value.toString();
			} else {
				this.parts.data = httpparse.build_query(value);
			}
		},
		
		// SEND
		// sends request
		send: function () {
			var request = new XMLHttpRequest();
			request.open(this.method, this.url, false, this.username, this.password);
			
			for (var key in this.headers) {
				request.setRequestHeader(key, this.headers[key]);
			}
			
			try {
				request.mozBackgroundRequest = true;
			} catch (e) {}
			
			try {
				request.send(this.data);
			} catch (e) {} // TODO: retry request if it fails
			
			try {
				var headers = httpparse.parse_headers(request.getAllResponseHeaders());
			} catch (e) {
				var headers = {};
			}
			
			try {
				var statusText = request.statusText;
			} catch (e) {
				var statusText = '';
			}
			
			return new Response({code:request.status, message:statusText, headers:headers, data:request.responseText});
		},

		// EXPORT
		// exports important request parts
		export: function () {
			return {
				method  : this.method,
				url     : this.url,
				headers : httpparse.build_headers(this.headers),
				data    : this.data};
		},
		
		// IMPORT
		// imports important request parts
		import: function (object) {
			this.method = object.method;
			this.url = object.url;
			this.headers = object.headers;
			this.data = object.data;
		},
		
		// TOSTRING
		// calculates the string representation of request
		toString: function () {
			var request = extend({}, this);
			request.query = httpparse.build_query(request.query);
			request.headers = httpparse.build_headers(request.headers);
			
			return httpparse.build_request(request);
		},
		
		// VALUEOF
		// calculates the value representation of request
		valueOf: function () {
			return this.toString();
		},
	};
	
	/**
	 * REQUEST FACTORY
	 **/
	Request.factory = {
		// NEW REQUEST
		// factory method for creating new requests
		new_request: function (method, url, headers, data) {
			var parts = httpparse.polish_url(httpparse.parse_url(url));
			parts.method = method;
			
			if (type.is_string(headers)) {
				parts.headers = headers;
			} else {
				parts.headers = httpparse.build_headers(headers);
			}
			
			
			if (type.is_string(data)) {
				parts.data = data;
			} else {
				parts.data = httpparse.build_query(data);
			}
			
			return new Request(parts);
		},
		
		// NEW GET REQUEST
		// factory method for creating new GET requests
		new_get_request: function (url, headers) {
			return this.new_request('GET', url, headers, null);
		},
		
		// NEW POST REQUEST
		// factory method for creating new POST requests
		new_post_request: function (url, headers, data) {
			return this.new_request('POST', url, headers, data);
		},
		
		// NEW FROM EXPORT
		// factory method for creating new request from exported request parts
		new_from_export: function (object) {
			var request = new Request({});
			request.import(object);
			
			return request;
		},
	};
	
	// NAMESPACE
	// http namespace
	return {
		Response: Response,
		Request : Request};
})();

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/