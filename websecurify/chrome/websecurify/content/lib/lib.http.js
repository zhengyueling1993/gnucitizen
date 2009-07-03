/**
 * RAW CONSTRUCTOR
 **/
function Raw(value) {
	this.value = value;
}

/**
 * RAW PROTOTYPE
 **/
Raw.prototype = {
	toString: function () {
		return this.value.toString();
	},
	valueOf: function () {
		return this.value.valueOf();
	}
};

/**
 * QUERY CONSTRUCTOR
 **/
function Query(query) {
	this.query = {};
	
	if (typeof query == 'string') {
		this.update(Query.factory.new_from_string(query));
	} else
	if (query != undefined) {
		this.update(query);
	}
}

/**
 * QUERY PROTOTYPE
 **/
Query.prototype = {
	get: function (key) {
		return this.query[key];
	},
	set: function (key, val) {
		this.query[key] = val;
	},
	keys: function () {
		var keys = [];
		
		for (var key in this.query) {
			keys.push(key);
		}
		
		return keys;
	},
	update: function (query) {
		if (query instanceof Query) {
			var query = query.query;
		}
		
		for (var key in query) {
			if (typeof query[key] != 'function') {
				if (key) {
					this.query[key] = query[key];
				}
			}
		}
	},
	toString: function () {
		return Query.factory.build_query(this.query);
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * QUERY FACTORY
 **/
Query.factory = {
	parse_query: function (str) {
		var query = {};
		var tokens = str.split('&');
		
		for (var i = 0; i < tokens.length; i++) {
			var pair = tokens[i].split('=');
			query[pair[0]] = pair[1];
		}
		
		return query;
	},
	build_query: function (query) {
		var tokens = [];
		
		for (var key in query) {
			if (key) {
				tokens.push(escape(key) + '=' + (query[key] ? query[key] instanceof Raw ? query[key] : escape(query[key]) : ''));
			}
		}
		
		return tokens.join('&');
	},
	new_from_string: function (str) {
		return new Query(Query.factory.parse_query(str));
	},
	new_from_query_object: function (query_obj) {
		return new Query(query_obj.query);
	},
};

/**
 * HEADERS CONSTRUCTOR
 **/
function Headers(headers) {
	this.headers = {};
	
	if (typeof headers == 'string') {
		this.update(Headers.factory.new_from_string(headers));
	} else
	if (headers != undefined) {
		this.update(headers);
	}
}

/**
 * HEADERS PROTOTYPE
 **/
Headers.prototype = {
	get: function (key) {
		return this.headers[key];
	},
	set: function (key, val) {
		this.headers[key] = val;
	},
	keys: function () {
		var keys = [];
		
		for (var key in this.headers) {
			keys.push(key);
		}
		
		return keys;
	},
	update: function (headers) {
		if (headers instanceof Headers) {
			var headers = headers.headers;
		}
		
		for (var key in headers) {
			if (typeof headers[key] != 'function') {
				this.headers[key] = headers[key];
			}
		}
	},
	toString: function () {
		return Headers.factory.build_headers(this.headers);
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * HEADERS FACTORY
 **/
Headers.factory = {
	parse_headers: function (str) {
		var headers = {};
		var tokens = str.replace(/^\s*|\s*$/g, '')
		                .replace('\r\n', '\n')
		                .split('\n');
		
		for (var i = 0; i < tokens.length; i++) {
			var pair = tokens[i].split(':');
			
			var key = pair[0];
			var val = pair[1];
			
			if (key && val != undefined) {
				headers[key.replace(/^\s*|\s*$/g, '')] = val.replace(/^\s*|\s*$/g, '');
			}
		}
		
		return headers;
	},
	build_headers: function (headers) {
		var tokens = [];
		
		for (var key in headers) {
			if (key) {
				tokens.push(key + ': ' + (headers[key] ? headers[key] : ''));
			}
		}
		
		return tokens.join('\r\n');
	},
	new_from_string: function (str) {
		return new Headers(Headers.factory.parse_headers(str));
	},
	new_from_headers_object: function (headers_obj) {
		return new Headers(headers_obj.headers);
	},
};

/**
 * URL CONSTRUCTOR
 **/
function Url(url) {
	if (typeof url == 'string') {
		this.update(Url.factory.new_from_string(url));
	} else {
		this.update(Url.factory.polish_url(url));
	}
}

/**
 * URL PROTOTYPE
 **/
Url.prototype = {
	update: function (parts) {
		var fields = ['protocol', 'username', 'password', 'hostname', 'port', 'pathname', 'query', 'fragment', 'pathinfo'];
		
		for (var i in fields) {
			if (typeof parts[fields[i]] != 'undefined') {
				if (fields[i] == 'query') {
					this[fields[i]] = new Query(parts[fields[i]]);
				} else {
					this[fields[i]] = parts[fields[i]];
				}
			}
		}
	},
	toString: function () {
		return Url.factory.build_url(this);
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * URL FACTORY
 **/
Url.factory = {
	reveal_path: function (path) {
		if (path.match(/\.\.\/|\.\//)) {
			var parts = [];
			var tokens = path.split('/');
			
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
			
			var path = ('/' + parts.join('/')).replace(/\/+/g, '/');
		}
		
		return path;
	},
	polish_url: function (url) {
		if (!url.hostname) {
			throw 'no hostname provided';
		}
		
		var protocol = url.protocol ? url.protocol.toLowerCase() : 'http';
		var username = url.username ? url.username : '';
		var password = url.password ? url.password : '';
		var hostname = url.hostname;
		var pathname = url.pathname ? Url.factory.reveal_path(url.pathname.replace(/^\/?/, '/')) : '/';
		var query    = new Query(url.query ? url.query : '');
		var fragment = url.fragment ? url.fragment : '';
		var pathinfo = pathname + (query.toString() ? '?' + query : '');
		
		if (typeof url.port != 'number') {
			var port = parseInt(url.port, 10);
			
			if (!port) {
				switch (protocol) {
					case 'http':
						var port = 80;
						break;
					case 'https':
						var port = 443;
						break;
					case 'ftp':
						var port = 21;
						break;
					default:
						var port = null;
						break;
				}
			}
		} else {
			var port = url.port;
		}
		
		return {
			protocol:protocol, username:username, password:password,
			hostname:hostname, port:port, pathname:pathname,
			query:query, fragment:fragment, pathinfo:pathinfo};
	},
	parse_url: function (url) {
		var url = url.replace(/^\s*|\s*$/g, '');
		
		var regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;
		var fields = {
			'protocol': 2,
			'username': 4,
			'password': 5,
			'hostname': 6,
			'port': 7,
			'pathname': 8,
			'query': 9,
			'fragment': 10
		};
		
		var parts = {};
		var match = regex.exec(url);
		
		for (var field in fields) {
			parts[field] = match[fields[field]];
		}
		
		var parts = Url.factory.polish_url(parts);
		
		return parts;
	},
	build_url: function (url) {
		var url = Url.factory.polish_url(url);
		
		var protocol = url.protocol;
		var username = url.username;
		var password = url.password;
		var hostname = url.hostname;
		var port     = url.port;
		var pathname = url.pathname;
		var query    = url.query;
		var fragment = url.fragment;
		var pathinfo = url.pathinfo;
		
		var proto = protocol + '://';
		var creds = username || password ? username + ':' + password + '@' : '';
		var porto = port != null && port != 80 ? ':' + port : '';
		var quero = query.toString() ? '?' + query : '';
		var frago = fragment ? '#' + fragment : '';
		
		return proto + creds + hostname + porto + pathname + quero + frago;
	},
	new_from_string: function (str) {
		return new Url(Url.factory.parse_url(str));
	},
	new_from_url_object: function (url_obj) {
		var url = {};
		
		for (var parameter in url_obj) {
			url[parameter] = url_obj[parameter];
		}
		
		url.query = Query.factory.new_from_query_object(url_obj.query);
		
		return new Url(url);
	},
};

/**
 * RESPONSE CONSTRUCTOR
 **/
function Response(response) {
	if (typeof response == 'string') {
		this.update(Response.factory.new_from_string(response));
	} else
	if (response != undefined) {
		this.update(Response.factory.polish_response(response));
	}
}

/**
 * RESPONSE PROTOTYPE
 **/
Response.prototype = {
	update: function (parts) {
		var fields = ['status', 'statusText', 'headers', 'data'];
		
		for (var i in fields) {
			if (typeof parts[fields[i]] != 'undefined') {
				this[fields[i]] = parts[fields[i]];
			}
		}
	},
	toString: function () {
		return Response.factory.build_response(this);
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * RESPONSE FACTORY
 **/
Response.factory = {
	polish_response: function (response) {
		var status = response.status ? response.status : 200;
		var statusText = response.statusText ? response.statusText : 'OK';
		var headers = new Headers(response.headers ? response.headers : '');
		var data = response.data ? response.data : null;
		
		if (data) {
			if (!headers.get('Content-length')) {
				headers.set('Content-length', data.length);
			}
		}
		
		return {status:status, statusText:statusText, headers:headers, data:data};
	},
	parse_response: function (response) {
		// TODO: add code
	},
	build_response: function (response) {
		var response = Response.factory.polish_response(response);
		
		var status = response.status;
		var statusText = response.statusText;
		var headers = response.headers;
		var data = response.data ? '\r\n\r\n' + response.data : '';
		
		return 'HTTP/1.1 ' + status + ' ' + statusText + '\r\n' + headers + data + '\r\n\r\n';
	},
	new_from_url: function (url) {
		return Request.factory.new_from_url(url).send();
	},
	new_from_string: function (str) {
		return new Response(Response.factory.parse_response(str));
	},
	new_from_response_object: function (response_obj) {
		var response = {};
		
		for (var parameter in response_obj) {
			response[parameter] = response_obj[parameter];
		}
		
		response.headers = Headers.factory.new_from_headers_object(response.headers);
		
		return new Response(response);
	},
};

/**
 * REQUEST CONSTRUCTOR
 **/
function Request(request) {
	if (typeof request == 'string') {
		this.update(Request.factory.new_from_string(request));
	} else
	if (request != undefined) {
		this.update(Request.factory.polish_request(request));
	}
}

/**
 * REQUEST PROTOTYPE
 **/
Request.prototype = {
	update: function (parts) {
		var fields = ['method', 'url', 'headers', 'data'];
		
		for (var i in fields) {
			if (typeof parts[fields[i]] != 'undefined') {
				if (fields[i] == 'url') {
					this[fields[i]] = new Url(parts[fields[i]]);
				} else
				if (fields[i] == 'headers') {
					this[fields[i]] = new Headers(parts[fields[i]]);
				} else {
					this[fields[i]] = parts[fields[i]];
				}
			}
		}
	},
	send: function () {
		var request = Request.factory.polish_request(this);
		
		var method = request.method;
		var url = request.url;
		var headers = request.headers;
		var data = request.data;
		
		var request = new XMLHttpRequest();
		request.open(method, url, false);
		
		for (var key in headers.keys()) {
			request.setRequestHeader(key, headers.get(key));
		}
		
		try {
			request.mozBackgroundRequest = true;
		} catch (e) {}
		
		try {
			request.send(request.data);
		} catch (e) {} // TODO: retry request if it fails
		
		var response = {status:request.status, statusText:request.statusText, data:request.responseText};
		
		try {
			response.headers = request.getAllResponseHeaders();
		} catch (e) {
			response.headers = {};
		}
		
		return new Response(response);
	},
	toString: function () {
		return Request.factory.build_request(this);
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * REQUEST FACTORY
 **/
Request.factory = {
	polish_request: function (request) {
		if (!request.url) {
			throw 'no url provided';
		}
		
		var method = request.method ? request.method.toUpperCase() : request.data ? 'POST' : 'GET';
		var url = new Url(request.url);
		var headers = new Headers(request.headers ? request.headers : '');
		var data = request.data ? request.data : null;
		
		if (!headers.get('Server')) {
			headers.set('Server', url.hostname);
		}
		
		if (data) {
			if (!headers.get('Content-type')) {
				headers.set('Content-type', 'application/x-www-form-urlencoded');
			}
			
			if (!headers.get('Content-length')) {
				headers.set('Content-length', data.length);
			}
		}
		
		return {method:method, url:url, headers:headers, data:data};
	},
	parse_request: function (request) {
		// TODO: add code
	},
	build_request: function (request) {
		var request = Request.factory.polish_request(request);
		
		var method = request.method;
		var pathinfo = request.url.pathinfo;
		var headers = request.headers;
		var data = request.data ? '\r\n\r\n' + request.data : '';
		
		return method + ' ' + pathinfo + ' HTTP/1.1\r\n' + headers + data + '\r\n\r\n';
	},
	new_from_url: function (url) {
		return new Request({method:'GET', url:url, headers:{}, data:null});
	},
	new_from_string: function (str) {
		return new Request(Request.factory.parse_request(str));
	},
	new_from_request_object: function (request_obj) {
		var request = {};
		
		for (var parameter in request_obj) {
			request[parameter] = request_obj[parameter];
		}
		
		request.url = Url.factory.new_from_url_object(request.url);
		request.headers = Headers.factory.new_from_headers_object(request.headers);
		
		return new Request(request);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/