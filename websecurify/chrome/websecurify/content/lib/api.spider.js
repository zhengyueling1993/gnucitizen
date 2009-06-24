/**
 * SPIDER PROCESSOR WORKER CONSTRUCTOR
 **/
function SpiderProcessorWorker() {
	var base = 'chrome://websecurify/content/lib/';
	var processor = this;
	
	processor.available = true;
	
	processor.onmessage = undefined;
	processor.ondata = undefined;
	
	processor.worker = new Worker(base + 'worker.spiderprocessor.js');
	processor.register_observer(function (event) {
		if (event.data.message_type == 'SpiderProcessor.data') {
			if (processor.ondata != undefined) {
				processor.ondata(event.data);
			}
			
			processor.available = true;
		}
		
		if (processor.onmessage != undefined) {
			processor.onmessage(event.data);
		}
	});
}

/**
 * SPIDER PROCESSOR WORKER PROTOTYPE
 **/
SpiderProcessorWorker.prototype = {
	process: function (request) {
		this.available = false;
		this.worker.postMessage({message_type:'process', request:request});
	},
	is_available: function () {
		return this.available;
	},
	terminate: function () {
		this.worker.terminate();
	},
	register_observer: function (observer) {
		this.worker.addEventListener('message', observer, true);
	},
	unregister_observer: function (observer) {
		this.worker.removeEventListener('message', observer, true);
	},
};

/**
 * SPIDER WORKER CONSTRUCTOR
 **/
function SpiderWorker() {
	var base = 'chrome://websecurify/content/lib/';
	var spider = this;
	
	spider.onmessage = undefined;
	spider.ondata = undefined;
	spider.onfinished = undefined;
	
	spider.worker = new Worker(base + 'worker.spider.js');
	spider.register_observer(function (event) {
		if (event.data.message_type == 'Spider.data') {
			if (spider.ondata != undefined) {
				spider.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'Spider.finished') {
			if (spider.onfinished != undefined) {
				spider.onfinished(event.data);
			}
		}
		
		if (spider.onmessage != undefined) {
			spider.onmessage(event.data);
		}
	});
}

/**
 * SPIDER WORKER PROTOTYPE
 **/
SpiderWorker.prototype = {
	spider: function (url) {
		this.worker.postMessage({message_type:'spider', url:url});
	},
	rescale: function (scale) {
		this.worker.postMessage({message_type:'rescale', scale:scale});
	},
	rescope: function (scope) {
		this.worker.postMessage({message_type:'rescope', scope:scope});
	},
	terminate: function () {
		this.worker.terminate();
	},
	register_observer: function (observer) {
		this.worker.addEventListener('message', observer, true);
	},
	unregister_observer: function (observer) {
		this.worker.removeEventListener('message', observer, true);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/