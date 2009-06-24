/**
 * IMPORT SCRIPTS
 **/
importScripts('api.spider.js');
importScripts('api.engine.js');

/**
 * ENGINE PROCESSOR CONSTRUCTOR
 **/
function EngineProcessor() {
	var processor = this;
	
	processor.spidered_urls = 1;
	processor.max_urls_to_spider = 1000;
	
	processor.spider = new SpiderWorker();
	processor.spider.register_observer(function (event) {
		if (event.data.message_type == 'Spider.data') {
			processor.forward_message(event.data);
			
			if (processor.spidered_urls < processor.max_urls_to_spider) {
				processor.spidered_urls += 1;
			} else {
				processor.spider.terminate();
			}
			
			processor.post_progress('found url ' + event.data.request.url);
		} else
		if (event.data.message_type == 'Spider.finished') {
			processor.forward_message(event.data);
			processor.spider.terminate();
			
			processor.max_urls_to_spider = processor.spidered_urls;
			
			processor.post_progress('spidering finished');
		}
	});
}

/**
 * ENGINE PROCESSOR PROTOTYPE
 **/
EngineProcessor.prototype = {
	process: function (target) {
		var include = '^' + target.replace(new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g'), '\\$&');
		var exclude = '\\.(jpg|gif|png|avi|mov|divx|mp4|mpg|mp3|mpeg|zip|tar|gz|swf|pdf)$';
		
		this.spider.rescope({include:include, exclude: exclude});
		this.spider.rescale(10);
		this.spider.spider(target);
	},
	get max_steps() {
		return this.max_urls_to_spider;
	},
	get current_step() {
		return this.spidered_urls;
	},
	post_progress: function (status) {
		var progress = Math.round((100/this.max_steps)*this.current_step);
		
		if (progress == 100) {
			var status = 'completed';
		} else
		if (status != undefined) {
			var status = status;
		} else {
			var status = '';
		}
		
		this.post_message('EngineProcessor.progress', {progress:progress, status:status});
	},
	post_message: function (message_type, message) {
		message.message_type = message_type;
		postMessage(message);
	},
	forward_message: function (message) {
		postMessage(message);
	},
};

/**
 * ENGINE CONSTRUCTOR
 **/
function Engine() {
	this.processors = [];
}

/**
 * ENGINE PROTOTYPE
 **/
Engine.prototype = {
	initiate: function (target) {
		var engine = this;
		
		var processor = new EngineProcessorWorker();
		processor.process(target);
		processor.register_observer(function (event) {
			var data = event.data;
			data.target = target;
			
			if (event.data.message_type == 'EngineProcessor.progress') {
				engine.post_message('Engine.progress', data);
			} else {
				engine.forward_message(data);
			}
		});
		
		engine.processors.push(processor);
	},
	post_message: function (message_type, message) {
		message.message_type = message_type;
		postMessage(message);
	},
	forward_message: function (message) {
		postMessage(message);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/