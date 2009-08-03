/**
 *    api.engine.js
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
 * ENGINE CONSTRUCTOR
 **/
var Engine = function () {
	var engine = this;
	
	engine.worker = new Worker(this.base + 'worker.engine.js');
	
	engine.register_observer(function (event) {
		if (event.data.message_type == 'Engine.progress') {
			if (engine.onprogress != undefined) {
				engine.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'Engine.finished') {
			if (engine.onfinished != undefined) {
				engine.onfinished(event.data);
			}
		}
		
		if (engine.onmessage != undefined) {
			engine.onmessage(event.data);
		}
	});
};

/**
 * ENGINE PROTOTYPE
 **/
Engine.prototype = {
	// BASE
	// path to base
	base: 'chrome://websecurify/content/lib/',
	
	// EVENT HANDLERS
	// spider event handlers
	onmessage: undefined,
	onprogress: undefined,
	onfinished: undefined,
	
	// INITIATE
	// starts engine process
	initiate: function (target) {
		this.worker.postMessage({message_type:'initiate', target:target});
	},
	
	// TERMINATE
	// terminate engine worker
	terminate: function () {
		this.worker.terminate();
	},
	
	// REGISTER OBSERVER
	// registers worker event observer
	register_observer: function (observer) {
		this.worker.addEventListener('message', observer, false);
	},
	
	// UNREGISTER OBSERVER
	// unregisters worker event observer
	unregister_observer: function (observer) {
		this.worker.removeEventListener('message', observer, false);
	},
};

/* by Petko D. (pdp) Petkov
 * GNUCITIZEN
 **************************/