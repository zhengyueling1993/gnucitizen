/**
 * FUZZER CONSTRUCTOR
 **/
function Fuzzer() {
	var base = 'chrome://websecurify/content/lib/';
	var fuzzer = this;
	
	fuzzer.onmessage = undefined;
	fuzzer.ondata = undefined;
	fuzzer.onprogress = undefined;
	fuzzer.onfinished = undefined;
	
	fuzzer.worker = new Worker(base + 'worker.fuzzer.js');
	fuzzer.register_observer(function (event) {
		if (event.data.message_type == 'FuzzerWorker.data') {
			if (fuzzer.ondata != undefined) {
				fuzzer.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'FuzzerWorker.progress') {
			if (fuzzer.onprogress != undefined) {
				fuzzer.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'FuzzerWorker.finished') {
			if (fuzzer.onfinished != undefined) {
				fuzzer.onfinished(event.data);
			}
		}
		
		if (fuzzer.onmessage != undefined) {
			fuzzer.onmessage(event.data);
		}
	});
}

/**
 * FUZZER PROTOTYPE
 **/
Fuzzer.prototype = {
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