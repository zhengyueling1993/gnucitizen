/**
 *    lib.httparse.js v0.1
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

/**
 * HTTPARSE
 **/
httparse = (function () {
	// IS STRING
	// checks if string
	var is_string = function (value) {
		return typeof value == 'string' || (typeof value == 'object' && value.constructor.toString().match(/string/i));
	};
	
	// IS NUMBER
	// checks if number
	var is_number = function (value) {
		return typeof value == 'number' || (typeof value == 'object' && value.constructor.toString().match(/number/i));
	};
	
	// PARSE QUERY
	// parses query string into object
	var parse_query = function (string) {
		var query = {};

		var tokens = string.split('&');

		for (var i = 0; i < tokens.length; i++) {
			var pair = tokens[i].split('=');

			if (pair[0]) {
				var key = unescape(pair[0]);
				var val = pair[1] ? unescape(pair[1]) : '';

				query[key] = val;
			}
		}

		return query;
	};

	// BUILD QUERY
	// builds query object into string
	var build_query = function (object) {
		var tokens = [];

		for (var key in object) {
			if (key) {
				var key = escape(key);
				var val = escape(object[key].toString());

				tokens.push(key + '=' + val);
			}
		}

		return tokens.join('&');
	};

	// PARSE HEADERS
	// parses headers string into object
	var parse_headers = function (string) {
		var headers = {};

		var tokens = string.replace(/^\s*|\s*$/g, '')
		                   .replace('\r\n', '\n')
		                   .split('\n');

		for (var i = 0; i < tokens.length; i++) {
			var pair = tokens[i].split(':');
			
			if (pair[0]) {
				var key = pair[0].replace(/^\s*|\s*$/g, '');
				var val = pair[1] ? pair[1].replace(/^\s*|\s*$/g, '') : '';

				query[key] = val;
			}
		}

		return headers;
	};

	// BUILD HEADERS
	// builds headers object into string
	var build_headers = function (object) {
		var tokens = [];

		for (var key in object) {
			if (key) {
				tokens.push(key + ': ' + (object[key] ? object[key] : '').toString().replace(/^\s*|\s*$/g, ''));
			}
		}

		return tokens.join('\r\n');
	};

	// PARSE URL
	// parses url string into object
	var parse_url = function (string) {
		var string = string.replace(/^\s*|\s*$/g, '');

		var regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;

		var fields = {
			'protocol': 2,
			'username': 4,
			'password': 5,
			'hostname': 6,
			'port'    : 7,
			'pathname': 8,
			'query'   : 9,
			'fragment': 10};

		var parts = {};

		var match = regex.exec(string);

		for (var field in fields) {
			parts[field] = match[fields[field]];
		}

		return parts;
	};

	// BUILD URL
	// builds url object into string
	var build_url = function (object) {
		var proto = object.protocol + '://';
		var creds = object.username || object.password ? (object.username ? object.username : '') + ':' + (object.password ? object.password : '') + '@' : '';
		var porto = object.port && object.port != 80 ? ':' + object.port : '';
		var quero = object.query ? '?' + object.query : '';
		var frago = object.fragment ? '#' + object.fragment : '';

		return proto + creds + object.hostname + porto + object.pathname + quero + frago;
	};

	// POLISH PATHNAME
	// polishes pathname string
	var polish_pathname = function (string) {
		if (string.match(/\.\.\/|\.\//)) {
			var parts = [];

			var tokens = string.split('/');

			for (var i = 0; i < tokens.length; i++) {
				if (tokens[i] == '.') {
					continue;
				} else
				if (tokens[i] == '..') {
					parts.pop();
				} else {
					parts.push(tokens[i]);
				}
			}

			var string = ('/' + parts.join('/'));
		}

		return string.replace(/\/+/g, '/');
	};

	// POLISH URL
	// polishes url object
	var polish_url = function (object) {
		var protocol = object.protocol ? object.protocol.toString().toLowerCase() : 'http';
		var username = object.username ? object.username.toString() : undefined;
		var password = object.password ? object.password.toString() : undefined;
		var hostname = object.hostname ? object.hostname.toString() : 'localhost';
		var pathname = object.pathname ? polish_pathname(object.pathname.toString().replace(/^\/?/, '/')) : '/';
		var query    = object.query ? object.query.toString() : '';
		var fragment = object.fragment ? object.fragment.toString() : '';

		if (is_number(object.port)) {
			var port  = object.port >= 0 ? object.port : undefined;
		} else
		if (is_string(object.port)) {
			try {
				var port = parseInt(object.port.toString(), 10);
				var port  = object.port >= 0 ? object.port : undefined;
			} catch (e) {
				var port = undefined;
			}
		} else {
			switch (protocol) {
				case 'ftp'  : var port = 21       ; break;
				case 'http' : var port = 80       ; break;
				case 'https': var port = 443      ; break;
				default     : var port = undefined; break;
			};
		}

		return {
			protocol: protocol,
			username: username,
			password: password,
			hostname: hostname,
			port    : port,
			pathname: pathname,
			query   : query,
			fragment: fragment};
	};

	// PARSE RESPONSE
	// parses response string into object
	var parse_response = function (string) {
		// TODO
	}

	// BUILD RESPONSE
	// builds response object into string
	var build_response = function (object) {
		var data = object.data ? '\r\n\r\n' + response.data : '';

		return 'HTTP/1.1 ' + object.code + ' ' + object.message + '\r\n' + object.headers + data + '\r\n\r\n';
	};

	// PARSE REQUEST
	// parses request string into object
	var parse_request = function (string) {
		// TODO
	};

	// BUILD REQUEST
	// builds request object into string
	var build_request = function (object) {
		var url = polish_url(parse_url(object.url));
		var pathinfo = url.pathname + (url.query ? '?' + url.query : '');

		var headers = parse_headers(object.headers);
		headers['Host'] = url.hostname;

		var headers = build_headers(headers);
		var data = object.data ? '\r\n\r\n' + object.data : '';

		return object.method + ' ' + pathinfo + ' HTTP/1.1\r\n' + headers + data + '\r\n\r\n';
	};
	
	// NAMESPACE
	// httparse namespace
	return {
		parse_query    : parse_query,
		build_query    : build_query,
		parse_headers  : parse_headers,
		build_headers  : build_headers,
		parse_url      : parse_url,
		build_url      : build_url,
		polish_pathname: polish_pathname,
		polish_url     : polish_url,
		parse_response : parse_response,
		build_response : build_response,
		parse_request  : parse_request,
		build_request  : build_request,
	};
})();