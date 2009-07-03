/**
 * IMPORTS
 **/
Components.utils.import("resource://websecurify/content/mod/globals.jsm");

/**
 * MEDIATOR
 **/
var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                         .getService(Components.interfaces.nsIWindowMediator);

/**
 * PROMPTS
 **/
var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
                        .getService(Components.interfaces.nsIPromptService);

/**
 * ON LOAD
 * initialize application
 **/
window.addEventListener('load', function () {
	// register global tasks object
	globals.tasks = {};
	
	// register new global engine
	globals.engine = new Engine();
	
	// observe the global engine progress
	globals.engine.onprogress = function (data) {
		globals.tasks[data.target].status = data.status;
		globals.tasks[data.target].progress = data.progress;
	};
	
	// observer the global engine messages
	globals.engine.onmessage = function (data) {
		globals.tasks[data.target].messages.push(data);
	};
	
	// register global engine initiation function
	globals.initiate_engine = function (target) {
		globals.tasks[target] = {progress:0, status:'initiated', messages:[]};
		globals.engine.initiate(target);
		
		main_tools_open_tasks();
	};
	///////////
	globals.initiate_engine('http://testasp.acunetix.com/');
}, true);

/**
 * ON CLOSE
 * exit application
 **/
window.addEventListener('close', function (event) {
	// ask for confirmation from the user
	/** TODO: uncomment
	if (!prompts.confirm(null, 'Websecurify', 'Do you really want to quit?')) {
		return event.preventDefault();
	}
	TODO: uncomment **/
	
	// get a reference to the app-startup service
	var ass = Components.classes['@mozilla.org/toolkit/app-startup;1']
	                    .getService(Components.interfaces.nsIAppStartup);
	
	// for the application to quit regardless of the current situation
	ass.quit(Components.interfaces.nsIAppStartup.eForceQuit);
}, true);

/**
 * MAIN TOOLS OPEN TASKS
 * open tasks window
 **/
function main_tools_open_tasks() {
	// get a reference to the tasks window
	var win = mediator.getMostRecentWindow('websecurify:tasks');
	
	// if the tasks window is not available...
	if (!win) {
		// ...open it
		window.open('chrome://websecurify/content/tasks.xul', '', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,chrome');
	} else {
		// ...otherwise focus it
		win.focus();
	}
}

/**
 * MAIN TOOLS OPEN ERROR CONSOLE
 * open xulrunner error console
 **/
function main_tools_open_error_console() {
	// get a reference to the error console
	var win = mediator.getMostRecentWindow('global:console');
	
	// if the error console is not available...
	if (!win) {
		// ...open it
		window.open('chrome://global/content/console.xul', '', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,chrome');
	} else {
		// ...otherwise focus it
		win.focus();
	}
}