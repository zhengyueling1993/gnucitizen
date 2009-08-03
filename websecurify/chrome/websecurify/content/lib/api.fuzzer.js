/**
 *    api.fuzzer.js
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
 * FUZZER CONSTRUCTOR
 **/
var Fuzzer = function () {
	var fuzzer = this;
	
	fuzzer.worker = new Worker(this.base + 'worker.fuzzer.js');
	
	fuzzer.register_observer(function (event) {
		if (event.data.message_type == 'Fuzzer.data') {
			if (fuzzer.ondata != undefined) {
				fuzzer.ondata(event.data);
			}
		} else
		if (event.data.message_type == 'Fuzzer.progress') {
			if (fuzzer.onprogress != undefined) {
				fuzzer.onprogress(event.data);
			}
		} else
		if (event.data.message_type == 'Fuzzer.finished') {
			if (fuzzer.onfinished != undefined) {
				fuzzer.onfinished(event.data);
			}
		}
		
		if (fuzzer.onmessage != undefined) {
			fuzzer.onmessage(event.data);
		}
	});
};

/**
 * FUZZER PROTOTYPE
 **/
Fuzzer.prototype = {
	// BASE
	// path to base
	base: 'chrome://websecurify/content/lib/',
	
	// EVENT HANDLERS
	// fuzzer event handlers
	onmessage: undefined,
	ondata: undefined,
	onprogress: undefined,
	onfinished: undefined,
	
	// INITIATE
	// starts fuzzing process
	initiate: function (request) {
		this.worker.postMessage({message_type:'initiate', request:request});
	},
	
	// TERMINATE
	// terminates fuzzing process
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