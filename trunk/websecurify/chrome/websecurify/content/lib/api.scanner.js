/**
 *    api.scanner.js
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
 * SCANNER CONSTRUCTOR
 **/
var Scanner = function () {
	var scanner = this;
	
	scanner.worker = new Worker(this.base + 'worker.scanner.js');
	
	scanner.register_observer(function (event) {
		if (event.data.message_type == 'Scanner.data') {
			if (scanner.ondata != undefined) {
				scanner.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'Scanner.progress') {
			if (scanner.onprogress != undefined) {
				scanner.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'Scanner.finished') {
			if (scanner.onfinished != undefined) {
				scanner.onfinished(event.data);
			}
		}
		
		if (scanner.onmessage != undefined) {
			scanner.onmessage(event.data);
		}
	});
};

/**
 * SCANNER PROTOTYPE
 **/
Scanner.prototype = {
	// BASE
	// path to base
	base: 'chrome://websecurify/content/lib/',
	
	// EVENT HANDLERS
	// scanner event handlers
	onmessage: undefined,
	ondata: undefined,
	onprogress: undefined,
	onfinished: undefined,
	
	// INITIATE
	// starts scanning process
	initiate: function (request) {
		this.worker.postMessage({message_type:'initiate', request:request});
	},
	
	// TERMINATE
	// terminates scanning process
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