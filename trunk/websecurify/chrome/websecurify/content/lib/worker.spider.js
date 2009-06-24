/**
 * IMPORT SCRIPTS
 **/
importScripts('lib.spider.js');

/**
 * SPIDER
 **/
var spider = new Spider();

/**
 * ON MESSAGE
 **/
function onmessage(event) {
	if (event.data.message_type == 'rescale') {
		if (event.data.scale == undefined) {
			throw 'no scale provided';
		}
		
		spider.rescale(event.data.scale);
	} else
	if (event.data.message_type == 'rescope') {
		if (event.data.scope == undefined) {
			throw 'no scope provided';
		}
		
		spider.rescope(event.data.scope);
	} else
	if (event.data.message_type == 'spider') {
		if (event.data.url == undefined) {
			throw 'no url provided';
		}
		
		spider.spider(event.data.url);
	}
}

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/