/**
 * IMPORTS
 **/
Components.utils.import("resource://websecurify/content/mod/globals.jsm");

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
			
			// ...get task element by id
			var $task = document.getElementById('task-' + task_name);
			
			// ...if there is no such task element
			if (!$task) {
				// ...create a new task element based on the blueprints
				var $task = document.getElementById('tasks-blueprints-task').cloneNode(true);
				
				// ...set the task element id
				$task.setAttribute('id', 'task-' + task_name);
				
				// ...set the task element description
				$task.getElementsByAttribute('id', 'tasks-blueprints-task-description')[0].setAttribute('value', task_name);
				
				// ...insert the task element to the tasks richlistbox
				$tasks.appendChild($task);
			}
			
			// ...set the task element status
			$task.getElementsByAttribute('id', 'tasks-blueprints-task-status')[0].setAttribute('value', task.status);
			
			// ...set the task element progress
			$task.getElementsByAttribute('id', 'tasks-blueprints-task-progress')[0].setAttribute('value', task.progress);
		}
	};
	
	// rebuild before we start
	rebuild();
	
	// set to rebuild every 10ms
	window.rebuild_interval = setInterval(rebuild, 10); // NOTE: 1ms result in a "Bus error"
}, false);

/**
 * ON CLOSE
 * exit window
 **/
window.addEventListener('close', function () {
	clearInterval(window.rebuild_interval);
}, false);

/**
 * TASKS OPEN STRUCTURE
 **/
function tasks_open_structure($button) {
	var task = (new String($button.parentNode.parentNode.getAttribute('id'))).replace(/^task-/, '');
	tasks_open_strcuture_for_task(task);
}

/**
 * TASKS OPEN STRUCTURE FOR TASK
 **/
function tasks_open_strcuture_for_task(task) {
	if (!window.structure_windows) {
		window.structure_windows = {};
	}
	
	if (!window.structure_windows[task]) {
		window.structure_windows[task] = openChromeWindow('chrome://websecurify/content/structure.xul', {task:task});
		window.structure_windows[task].addEventListener('close', function () {
			delete window.structure_windows[task];
		}, false);
	} else {
		window.structure_windows[task].focus();
	}
}

/**
 * TASKS OPEN REPORT
 **/
function tasks_open_report($button) {
	var task = (new String($button.parentNode.parentNode.getAttribute('id'))).replace(/^task-/, '');
	tasks_open_report_for_task(task);
}

/**
 * TASKS OPEN REPORT FOR TASK
 **/
function tasks_open_report_for_task(task) {
	if (!window.report_windows) {
		window.report_windows = {};
	}
	
	if (!window.report_windows[task]) {
		window.report_windows[task] = openChromeWindow('chrome://websecurify/content/report.xul', {task:task});
		window.report_windows[task].addEventListener('close', function () {
			delete window.report_windows[task];
		}, false);
	} else {
		window.report_windows[task].focus();
	}
}