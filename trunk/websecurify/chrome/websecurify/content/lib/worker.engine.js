/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.engine.js');

/**
 * ENGINE
 **/
var engine = new Engine();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'initiate') {
		if (event.data.target == undefined) {
			throw 'no target provided';
		}
		
		engine.initiate(event.data.target);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/