/**
 * IMPORTS
 **/
Components.utils.import("resource://websecurify/mod/globals.jsm");

/**
 * ON LOAD
 * initialize window
 **/
window.addEventListener('load', function () {
	// get a reference to the tasks richlistbox
	var $tasks = document.getElementById('tasks-richlistbox');
	
	// rebuild the tasks richlistbox
	var rebuild = function () {
		// for all global tasks...
		for (var task_name in globals.tasks) {
			// ...get a task
			var task = globals.tasks[task_name];
			
			// ...get task by id
			var $task = document.getElementById('task-' + task_name);
			
			// ...if there is no such task
			if (!$task) {
				// ...create a new task based based on the tasks blueprints
				var $task = document.getElementById('tasks-blueprints').getElementsByAttribute('role', 'task')[0].cloneNode(true);
				
				// ...set the task id
				$task.setAttribute('id', 'task-' + task_name);
				
				// ...set the task description
				$task.getElementsByAttribute('role', 'description')[0].setAttribute('value', task_name);
				
				// ...inscert task to the tasks richlistbox
				$tasks.appendChild($task);
			}
			
			$task.getElementsByAttribute('role', 'status')[0].setAttribute('value', task.status);
			$task.getElementsByAttribute('role', 'progress')[0].setAttribute('value', task.progress);
		}
	};
	
	// rebuild before we start
	rebuild();
	
	// set to rebuild every 10ms
	window.rebuild_interval = setInterval(rebuild, 10);
}, true);

/**
 * ON CLOSE
 * exit window
 **/
window.addEventListener('close', function () {
	clearInterval(window.rebuild_interval);
}, true);