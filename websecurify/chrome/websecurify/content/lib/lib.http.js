/**
 * URL CONSTRUCTOR
 **/
function URL(path, base) {
	this.rebuild(path, base);
}

/**
 * URL PROTOTYPE
 **/
URL.prototype = {
	resolve: function (url) {
		var url = url.replace(/&amp;/gi, '&')
		             .replace(/&quote;/gi, '"'); // TODO: add more html entities
		
		return url;
	},
	real: function (url) {
		var url = url.split('#')[0];
		
		if (url.match(/\.\.\/|\.\//)) {
			var host = url.replace(/^(\w+?:\/\/.*?)\/.*/, '$1');
			var info = url.substr(host.length, url.length - host.length).split('?');
			
			var path = info[0];
			var query = info[1];
			
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
			
			path = ('/' + parts.join('/')).replace(/\/+/g, '/');
			url = host + path + (query ? '?' + query : '');
		}
		
		return url.replace(/(^\s*|\s*$)/g, '');
	},
	rebuild: function (path, base) {
		if (!path) {
			throw 'no path specified';
		}
		
		path = path.replace(/^\s*|\s*$/g, '')
		           .replace(/^(\w+?:\/\/[^\/]+)(?:\/(.*))?/, '$1/$2');
		
		if (path.match(/^\w+:\/\/.+/)) {
			this.url = path;
		} else {
			if (!base) {
				throw 'cannot rebuild the url';
			} else {
				base = base.split('#')[0]
				           .split('?')[0].replace(/^\s*|\s*$/g, '')
				                         .replace(/^(\w+?:\/\/[^\/]+)(?:\/(.*))?/, '$1/$2');
				
				if (path[0] == '/') {
					this.url = base.replace(/^(\w+:\/\/.*?)\/.*/i, '$1') + path;
				} else {
					if (base.substr(-1) != '/') {
						this.url = base.replace(/\/[^\/]+$/, '/') + path;
					} else {
						this.url = base + path;
					}
				}
			}
		}
		
		this.url = this.resolve(this.url);
		this.url = this.real(this.url);
		
		if (this.url.match(/\s\+|\+\s/)) { // TODO: better check for invalid urls
			throw 'final url invalid';
		}
	},
	toString: function () {
		return this.url;
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * RESPONSE CONSTRUCTOR
 **/
function Response(status, statusText, responseText) {
	this.status = status;
	this.statusText = statusText;
	this.responseText = responseText;
}

/**
 * RESPONSE PROTOTYPE
 **/
Response.prototype = {
	toString: function () {
		return '[Request <' + [this.status, this.statusText, this.responseText].join(';') + '>]';
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * RESPONSE FACTORY
 **/
Response.factory = {
	new_from_object: function (response) {
		var status = response.status;
		var responseText = response.responseText;
		
		try {
			var statusText = response.statusText;
		} catch (e) {}
		
		return new Response(status, statusText, responseText);
	},
};

/**
 * REQUEST CONSTRUCTOR
 **/
function Request(method, url, headers, data) {
	this.method = method.toUpperCase();
	this.url = (new URL(url)).toString();
	this.headers = headers;
	this.data = data;
}

/**
 * REQUEST PROTOTYPE
 **/
Request.prototype = {
	send: function () {
		try {
			var request = new XMLHttpRequest();
			request.open(this.method, this.url, false);
			
			for (var name in this.headers) {
				var value = this.headers[name];
				
				request.setRequestHeader(name, value);
			}
			
			try {
				request.mozBackgroundRequest = true;
			} catch (e) {}
			
			request.send(request.data);
		} catch (e) {} // TODO: retry request if it fails
		
		return Response.factory.new_from_object(request);
	},
	in_scope: function (scope) {
		var include = scope.include;
		
		if (scope.include == undefined) {
			include = [];
		} else
		if (!(scope.include instanceof Array)) {
			include = [scope.include];
		}
		
		var exclude = scope.exclude;
		
		if (scope.exclude == undefined) {
			exclude = [];
		} else
		if (!(scope.exclude instanceof Array)) {
			exclude = [scope.exclude];
		}
		
		for (var i = 0; i < include.length; i++) {
			if (this.url.match(new RegExp(include[i], 'i'))) {
				for (var z = 0; z < exclude.length; z++) {
					if (this.url.match(new RegExp(exclude[z]), 'i')) {
						return false;
					}
				}
				
				return true;
			}
		}
		
		if (include.length > 0) {
			return false;
		}
		
		for (var z = 0; z < exclude.length; z++) {
			if (this.url.match(new RegExp(exclude[z]), 'i')) {
				return false;
			}
		}

		return true;
	},
	toString: function () {
		return '[Request <' + [this.method, this.url, this.headers, this.body].join(';') + '>]';
	},
	valueOf: function () {
		return this.toString();
	},
};

/**
 * REQUEST FACTORY
 **/
Request.factory = {
	new_from_object: function (request) {
		var url = request.url;
		var data = request.data;
		var method = request.method;
		var headers = request.headers;
		
		if (!request.url) {
			throw 'no url specified';
		}
		
		if (!request.data) {
			data = null;
		}
		
		if (!method) {
			method = (data == null ? 'GET' : 'POST');
		}
		
		if (!headers) {
			headers = {};
		}
		
		return new Request(method, url, headers, data);
	},
	new_from_url: function (url) {
		return new Request('GET', url, {}, null);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/