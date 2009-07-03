/**
 * IMPORTS
 **/
Components.utils.import("resource://websecurify/content/mod/globals.jsm");

/**
 * ON LOAD
 * initialize window
 **/
window.addEventListener('load', function () {
	// get a referene to the task name
	var task_name = window.arguments[0].task;
	
	// get a reference to the task
	var task = globals.tasks[task_name];
	
	// if task name given...
	if (task_name) {
		// ...change the title of the current window
		document.title = document.title + ' (' + task_name + ')';
		
		// ...set the current index of the tree to 0
		var index = 0;
		
		// ...get a reference to the report issues
		var issues = document.getElementById('report-issues');
		
		// ...declare a rebuild function
		function rebuild() {
		}
		
		// ...rebuild
		rebuild();
		
		// ...rebuild every 1000ms
		setInterval(rebuild, 1000);
	}
}, false);