/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.spider.js');

/**
 * PROCESSOR
 **/
var processor = new SpiderProcessor();

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