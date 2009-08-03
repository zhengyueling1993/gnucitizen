/**
 *    api.reporter.js
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
 * REPORTER CONSTRUCTOR
 **/
var Reporter = function () {
	var reporter = this;
	
	reporter.worker = new Worker(this.base + 'worker.reporter.js');
	
	reporter.register_observer(function (event) {
		if (event.data.message_type == 'ReporterWorker.data') {
			if (reporter.ondata != undefined) {
				reporter.ondata(event.data);
			}
		}
		
		if (reporter.onmessage != undefined) {
			reporter.onmessage(event.data);
		}
	});
};

/**
 * REPORTER PROTOTYPE
 **/
Reporter.prototype = {
	// BASE
	// path to base
	base: 'chrome://websecurify/content/lib/',
	
	// EVENT HANDLERS
	// spider event handlers
	onmessage: undefined,
	ondata: undefined,
	
	// INITIATE
	// starts reporting process
	initiate: function (message) {
		this.worker.postMessage({message_type:'initiate', message:message});
	},
	
	// TERMINATE
	// terminates reporting process
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