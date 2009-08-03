/**
 * IMPORTS
 **/
Components.utils.import("resource://websecurify/content/mod/globals.jsm");

/**
 * ON LOAD
 * initialize window
 **/
window.addEventListener('load', function () {
	var $tasks = document.getElementById('tasks-richlistbox');
	
	var rebuild = function () {
		for (var task_name in globals.tasks) {
			var task = globals.tasks[task_name];
			
			var $task = document.getElementById('task-' + task_name);
			
			if (!$task) {
				var $task = document.getElementById('tasks-blueprints-task').cloneNode(true);
				
				$task.setAttribute('id', 'task-' + task_name);
				
				$task.getElementsByAttribute('id', 'tasks-blueprints-task-description')[0].setAttribute('value', task_name);
				
				$tasks.appendChild($task);
			}
			
			$task.getElementsByAttribute('id', 'tasks-blueprints-task-status')[0].setAttribute('value', task.status);
			
			$task.getElementsByAttribute('id', 'tasks-blueprints-task-progress')[0].setAttribute('value', task.progress);
		}
	};
	
	rebuild();
	
	window.rebuild_interval = setInterval(rebuild, 10); // NOTE: 1ms results in a "Bus error"
	
	var tasks_message_indexes = {};
	
	var report = function () {
		for (var task_name in globals.tasks) {
			if (tasks_message_indexes[task_name] == undefined) {
				tasks_message_indexes[task_name] = 0;
			}
			
			var index = tasks_message_indexes[task_name];
			var length = tasks_message_indexes[task_name] = globals.tasks[task_name].messages.length;
			
			for (var i = index; i < length; i++) {
				var message = globals.tasks[task_name].messages[i];
				
				if (message.message_type == 'Engine.finished') {
					tasks_open_report_for_task(task_name);
				}
			}
		}
	};
	
	report();
	
	window.report_interval = setInterval(report, 10); // NOTE: 1ms results in a "Bus error"
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