/**
 * SCANNER CONSTRUCTOR
 **/
function Scanner() {
	var base = 'chrome://websecurify/content/lib/';
	var scanner = this;
	
	scanner.onmessage = undefined;
	scanner.ondata = undefined;
	scanner.onprogress = undefined;
	scanner.onfinished = undefined;
	
	scanner.worker = new Worker(base + 'worker.scanner.js');
	scanner.register_observer(function (event) {
		if (event.data.message_type == 'ScannerWorker.data') {
			if (scanner.ondata != undefined) {
				scanner.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'ScannerWorker.progress') {
			if (scanner.onprogress != undefined) {
				scanner.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'ScannerWorker.finished') {
			if (scanner.onfinished != undefined) {
				scanner.onfinished(event.data);
			}
		}
		
		if (scanner.onmessage != undefined) {
			scanner.onmessage(event.data);
		}
	});
}

/**
 * SCANNER PROTOTYPE
 **/
Scanner.prototype = {
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