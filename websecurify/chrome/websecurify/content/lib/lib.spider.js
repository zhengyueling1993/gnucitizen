/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.http.js');
importScripts('lib.html.js');
importScripts('lib.sets.js');

/**
 * SCOPE CONSTRUCTOR
 **/
function Scope(scope) {
	this.include = [];
	this.exclude = [];
	
	if (scope != undefined) {
		this.update(scope);
	}
}

/**
 * SCOPE PROTOTYPE
 **/
Scope.prototype = {
	update: function (scope) {
		if (typeof scope.include == 'string') {
			this.include.push(scope.include);
		} else
		if (scope.include instanceof Array) {
			for (var i = 0; i < scope.include.length; i++) {
				this.include.push(scope.include[i]);
			}
		}
		
		if (typeof scope.exclude == 'string') {
			this.exclude.push(scope.exclude);
		} else
		if (scope.exclude instanceof Array) {
			for (var i = 0; i < scope.exclude.length; i++) {
				this.exclude.push(scope.exclude[i]);
			}
		}
	},
	include_request: function (request) {
		this.include.push('^' + request.url.toString().replace(new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g'), '\\$&'));
	},
	exclude_request: function (request) {
		this.exclude.push('^' + request.url.toString().replace(new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g'), '\\$&'));
	},
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
 * SPIDER WORKER CONSTRUCTOR
 **/
function SpiderWorker() {
	this.step = 0;
	this.available = true;
	
	this.queue = new Set();
	this.scope = new Scope();
}

/**
 * SPIDER WORKER PROTOTYPE
 **/
SpiderWorker.prototype = {
	create_scope: function (scope) {
		this.scope = new Scope(scope);
	},
	update_scope: function (scope) {
		this.scope.update(scope);
	},
	initiate: function (request) {
		var request = new Request(request);
		
		this.scope.include_request(request);
		this.queue.push(request, false);
		
		this.process();
	},
	process: function () {
		while (true) {
			var request = this.queue.next();
			
			if (!request) {
				this.post_message('SpiderWorker.finished');
				
				break;
			}
			
			this.post_progress('spidering for ' + request.method + ' ' + request.url);
			
			var response = request.send();
			var links = (new Document(response.data, request.url)).links;
			
			for (var i = 0; i < links.length; i++) {
				var request_to_spider = Request.factory.new_from_url(links[i].split('#')[0]);
				
				if (this.scope.match(request_to_spider)) {
					this.queue.push(request_to_spider, false);
				}
			}
			
			this.step += 1;
			
			this.post_message('SpiderWorker.data', {request:request, response:response, links:links});
			this.post_progress('finished spidering for ' + request.method + ' ' + request.url);
		}
	},
	post_progress: function (status) {
		var step = this.step;
		var steps = this.queue.length;
		
		this.post_message('SpiderWorker.progress', {progress:Math.round((100 / steps) * step), step:(step + '/' + steps), status:status});
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