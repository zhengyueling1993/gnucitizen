/**
 *    api.spider.js
 *    Copyright (C) 2009  Petko D (pdp) Petkov (GNUCITIZEN)
 *    
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 2 of the License, or
 *   (at your option) any later version.
 *   
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *   
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, write to the Free Software
 *   Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 **/

/**
 * SPIDER CONSTRUCTOR
 **/
var Spider = function () {
	var spider = this;
	
	spider.worker = new Worker(this.base + 'worker.spider.js');
	
	spider.register_observer(function (event) {
		if (event.data.message_type == 'Spider.data') {
			if (spider.ondata != undefined) {
				spider.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'Spider.progress') {
			if (spider.onprogress != undefined) {
				spider.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'Spider.finished') {
			if (spider.onfinished != undefined) {
				spider.onfinished(event.data);
			}
		}
		
		if (spider.onmessage != undefined) {
			spider.onmessage(event.data);
		}
	});
};

/**
 * SPIDER PROTOTYPE
 **/
Spider.prototype = {
	// BASE
	// path to base
	base: 'chrome://websecurify/content/lib/',
	
	// EVENT HANDLERS
	// spider event handlers
	onmessage: undefined,
	ondata: undefined,
	onprogress: undefined,
	onfinished: undefined,
	
	// CREATE SCOPE
	// creates a new scope
	create_scope: function (scope) {
		this.worker.postMessage({message_type:'create_scope', scope:scope});
	},
	
	// UPDATE SCOPE
	// updates current scope
	update_scope: function (scope) {
		this.worker.postMessage({message_type:'update_scope', scope:scope});
	},
	
	// INITIATE
	// starts spidering process
	initiate: function (request) {
		this.worker.postMessage({message_type:'initiate', request:request});
	},
	
	// TERMINATE
	// terminates spidering process
	terminate: function () {
		this.worker.terminate();
	},
	
	// REGISTER OBSERVER
	// registers worker event observer
	register_observer: function (observer) {
		this.worker.addEventListener('message', observer, true);
	},
	
	// UNREGISTER OBSERVER
	// unregisters worker event observer
	unregister_observer: function (observer) {
		this.worker.removeEventListener('message', observer, true);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/