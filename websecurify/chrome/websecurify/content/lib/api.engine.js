/**
 * ENGINE CONSTRUCTOR
 **/
function Engine() {
	var base = 'chrome://websecurify/content/lib/';
	var engine = this;
	
	engine.onmessage = undefined;
	engine.onprogress = undefined;
	engine.onfinished = undefined;
	
	engine.worker = new Worker(base + 'worker.engine.js');
	engine.register_observer(function (event) {
		if (event.data.message_type == 'EngineWorker.progress') {
			if (engine.onprogress != undefined) {
				engine.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'EngineWorker.finished') {
			if (engine.onfinished != undefined) {
				engine.onfinished(event.data);
			}
		}
		
		if (engine.onmessage != undefined) {
			engine.onmessage(event.data);
		}
	});
}

/**
 * ENGINE PROTOTYPE
 **/
Engine.prototype = {
	initiate: function (target) {
		this.worker.postMessage({message_type:'initiate', target:target});
	},
	terminate: function () {
		this.worker.terminate();
	},
	register_observer: function (observer) {
		this.worker.addEventListener('message', observer, false);
	},
	unregister_observer: function (observer) {
		this.worker.removeEventListener('message', observer, false);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/