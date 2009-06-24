/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.fuzzer.js');

/**
 * PROCESSOR
 **/
var processor = new FuzzerProcessor();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'process') {
		if (event.data.request == undefined) {
			throw 'no request provided';
		}
		
		processor.process(event.data.request);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/