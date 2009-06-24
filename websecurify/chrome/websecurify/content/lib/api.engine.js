/**
 * ENGINE PROCESSOR WORKER CONSTRUCTOR
 **/
function EngineProcessorWorker() {
	var base = 'chrome://websecurify/content/lib/';
	var processor = this;
	
	processor.onmessage = undefined;
	processor.onprogress = undefined;
	
	processor.worker = new Worker(base + 'worker.engineprocessor.js');
	processor.register_observer(function (event) {
		if (event.data.message_type == 'EngineProcessor.progress') {
			if (processor.onprogress != undefined) {
				processor.onprogress(event.data);
			}
		}
		
		if (processor.onmessage != undefined) {
			processor.onmessage(event.data);
		}
	});
}

/**
 * ENGINE PROCESSOR WORKER PROTOTYPE
 **/
EngineProcessorWorker.prototype = {
	process: function (target) {
		this.worker.postMessage({message_type:'process', target:target});
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

/**
 * ENGINE WORKER CONSTRUCTOR
 **/
function EngineWorker() {
	var base = 'chrome://websecurify/content/lib/';
	var engine = this;
	
	engine.onmessage = undefined;
	engine.onprogress = undefined;
	
	engine.worker = new Worker(base + 'worker.engine.js');
	engine.register_observer(function (event) {
		if (event.data.message_type == 'Engine.progress') {
			if (engine.onprogress != undefined) {
				engine.onprogress(event.data);
			}
		}
		
		if (engine.onmessage != undefined) {
			engine.onmessage(event.data);
		}
	});
}

/**
 * ENGINE WORKER PROTOTYPE
 **/
EngineWorker.prototype = {
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