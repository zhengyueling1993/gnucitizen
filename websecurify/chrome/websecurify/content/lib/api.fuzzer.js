/**
 * FUZZER PROCESSOR WORKER CONSTRUCTOR
 **/
function FuzzerProcessorWorker() {
	var base = 'chrome://websecurify/content/lib/';
	var processor = this;
	
	processor.onmessage = undefined;
	processor.ondata = undefined;
	
	processor.worker = new Worker(base + 'worker.fuzzerprocessor.js');
	processor.register_observer(function (event) {
		if (event.data.message_type == 'FuzzerProcessor.data') {
			if (processor.ondata != undefined) {
				processor.ondata(event.data);
			}
		}
		
		if (processor.onmessage != undefined) {
			processor.onmessage(event.data);
		}
	});
}

/**
 * FUZZER PROCESSOR WORKER PROTOTYPE
 **/
FuzzerProcessorWorker.prototype = {
	process: function (request) {
		this.worker.postMessage({message_type:'process', request:request});
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
 * FUZZER WORKER CONSTRUCTOR
 **/
function FuzzerWorker() {
	var base = 'chrome://websecurify/content/lib/';
	var fuzzer = this;
	
	fuzzer.onmessage = undefined;
	fuzzer.ondata = undefined;
	
	fuzzer.worker = new Worker(base + 'worker.fuzzer.js');
	fuzzer.register_observer(function (event) {
		if (event.data.message_type == 'Fuzzer.data') {
			if (fuzzer.ondata != undefined) {
				fuzzer.ondata(event.data);
			}
		}
		
		if (fuzzer.onmessage != undefined) {
			fuzzer.onmessage(event.data);
		}
	});
}

/**
 * FUZZER WORKER PROTOTYPE
 **/
FuzzerWorker.prototype = {
	fuzz: function (request) {
		this.worker.postMessage({message_type:'fuzz', request:request});
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