/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.scanner.js');

/**
 * SCANNER WORKER
 **/
var scanner = new ScannerWorker();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'initiate') {
		if (event.data.request == undefined) {
			throw 'no request provided';
		}
		
		scanner.initiate(event.data.request);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/