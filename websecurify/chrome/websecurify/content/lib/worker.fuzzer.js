/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.fuzzer.js');

/**
 * FUZZER
 **/
var fuzzer = new Fuzzer();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'fuzz') {
		if (event.data.request == undefined) {
			throw 'no request provided';
		}
		
		fuzzer.fuzz(event.data.request);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/