/**
 * REPORTER CONSTRUCTOR
 **/
function Reporter() {
	var base = 'chrome://websecurify/content/lib/';
	var reporter = this;
	
	reporter.onmessage = undefined;
	reporter.ondata = undefined;
	
	reporter.worker = new Worker(base + 'worker.reporter.js');
	reporter.register_observer(function (event) {
		if (event.data.message_type == 'ReporterWorker.data') {
			if (reporter.ondata != undefined) {
				reporter.ondata(event.data);
			}
		}
		
		if (reporter.onmessage != undefined) {
			reporter.onmessage(event.data);
		}
	});
}

/**
 * REPORTER PROTOTYPE
 **/
Reporter.prototype = {
	initiate: function (message) {
		this.worker.postMessage({message_type:'initiate', message:message});
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