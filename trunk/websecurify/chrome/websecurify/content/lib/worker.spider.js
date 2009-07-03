/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.spider.js');

/**
 * SPIDER WORKER
 **/
var spider = new SpiderWorker();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'create_scope') {
		if (event.data.scope == undefined) {
			throw 'no scope provided';
		}
		
		spider.create_scope(event.data.scope);
	} else
	if (event.data.message_type == 'update_scope') {
		if (event.data.scope == undefined) {
			throw 'no scope provided';
		}
		
		spider.update_scope(event.data.scope);
	} else
	if (event.data.message_type == 'initiate') {
		if (event.data.request == undefined) {
			throw 'no request provided';
		}
		
		spider.initiate(event.data.request);
	} else {
		throw 'unknown message';
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/