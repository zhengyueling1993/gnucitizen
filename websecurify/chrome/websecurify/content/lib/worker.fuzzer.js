/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.fuzzer.js');

/**
 * FUZZER WORKER
 **/
var fuzzer = new FuzzerWorker();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'initiate') {
		if (event.data.request == undefined) {
			throw 'no request provided';
		}
		
		fuzzer.initiate(event.data.request);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/