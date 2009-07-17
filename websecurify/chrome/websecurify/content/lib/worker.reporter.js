/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.reporter.js');

/**
 * REPORTER WORKER
 **/
var reporter = new ReporterWorker();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'initiate') {
		if (event.data.message == undefined) {
			throw 'no message provided';
		}
		
		reporter.initiate(event.data.message);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/