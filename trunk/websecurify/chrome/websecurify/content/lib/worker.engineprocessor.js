/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.engine.js');

/**
 * PROCESSOR
 **/
var processor = new EngineProcessor();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'process') {
		if (event.data.target == undefined) {
			throw 'no target provided';
		}
		
		processor.process(event.data.target);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/