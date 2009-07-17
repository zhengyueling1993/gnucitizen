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
		var $issues = document.getElementById('report-issues');
		
		// ...declare a rebuild function
		function rebuild() {
			// ...the i is equal to the current index of the issues
			var i = index;
			
			// ...the new index is equal to the number of messages available for this task
			index = task.messages.length;
			
			// ...for every i
			for (i; i < index; i++) {
				// ...get a message
				var message = task.messages[i];
				
				// ...if message is ReporterWorker.data
				if (message.message_type == 'ReporterWorker.data') {
					// ...create a new issue element based on the blueprints
					var $issue = document.getElementById('report-blueprints-issue').cloneNode(true);
					
					// ...set the issue element title
					$issue.getElementsByAttribute('id', 'report-blueprints-issue-title')[0].setAttribute('value', message.title);
					
					// ...set the issue element description
					$issue.getElementsByAttribute('id', 'report-blueprints-issue-description')[0].innerHTML = message.description;
					
					// ...insert the issue element to the issues
					$issues.appendChild($issue);
				}
			}
		}
		
		// ...rebuild
		rebuild();
		
		// ...rebuild every 1000ms
		setInterval(rebuild, 1000);
	}
}, false);