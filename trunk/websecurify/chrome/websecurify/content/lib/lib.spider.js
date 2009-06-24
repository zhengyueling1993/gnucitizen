/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.queue.js');
importScripts('lib.http.js');
importScripts('api.spider.js');

/**
 * SPIDER PROCESSOR CONSTRUCTOR
 **/
function SpiderProcessor() {
	// pass
}

/**
 * SPIDER PROCESSOR PROTOTYPE
 **/
SpiderProcessor.prototype = {
	extract_urls: function (source, base) {
		var urls = [];
		
		var match = source.match(/(\w+?:\/\/\w+[^\s"'><)()]*)/gi);
		if (match) {
			for (var i = 0; i < match.length; i++) {
				try {
					urls.push((new URL(match[i])).toString());
				} catch (e) {}
			}
		}
		
		var match = source.match(/(src|href)\s*=\s*('[^']*'|"[^"]*")/gi);
		if (match) {
			for (var i = 0; i < match.length; i++) {
				var m = match[i];
				var inner = match[i].replace(/(^(src|href)\s*=\s*("|')|("|')$)/gi, '')
				                    .replace(/(^\s*|\s*$)/g, '');
				
				if (inner.match(/^(about|javascript|data|mailto):/gi)) { // TODO: more known protocols
					continue;
				}
				
				try {
					urls.push((new URL(inner)).toString());
				} catch (e) {
					try {
						urls.push((new URL(inner, base)).toString());
					} catch (e) {}
				}
			}
		}
		
		var _urls = [];

		label:for (var i = 0, n = urls.length; i < n; i++) {
			for (var x = 0, y = _urls.length; x < y; x++) {
				if (_urls[x] == urls[i]) {
					continue label;
				}
			}
			
			_urls.push(urls[i]);
		}
		
		return _urls;
	},
	process: function (request) {
		var _request = Request.factory.new_from_object(request);
		var _response = _request.send();
		
		var urls = this.extract_urls(_response.responseText, _request.url);
		
		this.post_message('SpiderProcessor.data', {request:_request, response:_response, urls:urls});
	},
	post_message: function (message_type, message) {
		message.message_type = message_type;
		postMessage(message);
	},
};

/**
 * SPIDER CONSTRUCTOR
 **/
function Spider() {
	this.scale = 1;
	this.timer = 0;
	this.scope = {};
	this.processors = [];
	this.requests = new Queue();
}

/**
 * SPIDER PROTOTYPE
 **/
Spider.prototype = {
	rescale: function (scale) {
		this.scale = scale;
		this.schedule();
	},
	rescope: function (scope) {
		this.scope = scope;
	},
	schedule: function () {
		var spider = this;
		
		if (spider.scale > spider.processors.length) {
			for (var i = 0; i < spider.scale - spider.processors.length; i++) {
				var processor = new SpiderProcessorWorker();
				processor.register_observer(function (event) {
					if (event.data.message_type == 'SpiderProcessor.data') {
						for (var i = 0; i < event.data.urls.length; i++) {
							var request = Request.factory.new_from_url(event.data.urls[i]);
							
							if (request.in_scope(spider.scope)) {
								spider.requests.push(request);
							}
						}
						
						spider.post_message('Spider.data', event.data);
						spider.schedule();
					}
				});
				
				spider.processors.push(processor);
			}
		} else
		if (spider.scale < spider.processors.length) {
			for (var i = 0; i < spider.processors.length - spider.scale; i++) {
				for (var z = 0; z < spider.processors.length; z++) {
					if (spider.processors[z].is_available()) {
						spider.processors[z].terminate();
						delete spider.processors[z];
						
						break;
					}
				}
			}
		}
		
		for (var z = 0; z < spider.processors.length; z++) {
			if (spider.processors[z].is_available()) {
				var request = spider.requests.pop();
				
				if (!request) {
					break;
				} else {
					spider.processors[z].process(request);
				}
			}
		}
	},
	spider: function (url) {
		var request = Request.factory.new_from_url(url);
		
		if (request.in_scope(this.scope)) {
			this.requests.push(request);
		}
		
		if (!this.timer) {
			var spider = this;
			
			spider.timer = setInterval(function () {
				if (spider.requests.length == 0) {
					var available_processors = 0;

					for (var i = 0; i < spider.processors.length; i++) {
						if (spider.processors[i].is_available()) {
							available_processors +=1;
						}
					}

					if (available_processors == spider.processors.length) {
						spider.post_message('Spider.finished');
						clearInterval(spider.timer);
					}
				}
			}, 1000);
		}
		
		this.schedule();
	},
	post_message: function (message_type, message) {
		if (message == undefined) {
			var message = {};
		} else {
			var message = message;
		}
		
		message.message_type = message_type;
		postMessage(message);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/