/**
 * SPIDER CONSTRUCTOR
 **/
function Spider() {
	var base = 'chrome://websecurify/content/lib/';
	var spider = this;
	
	spider.onmessage = undefined;
	spider.ondata = undefined;
	spider.onprogress = undefined;
	spider.onfinished = undefined;
	
	spider.worker = new Worker(base + 'worker.spider.js');
	spider.register_observer(function (event) {
		if (event.data.message_type == 'SpiderWorker.data') {
			if (spider.ondata != undefined) {
				spider.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'SpiderWorker.progress') {
			if (spider.onprogress != undefined) {
				spider.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'SpiderWorker.finished') {
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
 * SPIDER PROTOTYPE
 **/
Spider.prototype = {
	create_scope: function (scope) {
		this.worker.postMessage({message_type:'create_scope', scope:scope});
	},
	update_scope: function (scope) {
		this.worker.postMessage({message_type:'update_scope', scope:scope});
	},
	initiate: function (request) {
		this.worker.postMessage({message_type:'initiate', request:request});
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