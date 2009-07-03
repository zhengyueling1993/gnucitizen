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
		
		// ...get a reference to the webtree component
		var webtree = document.getElementById('structure-webtree');
		
		// ...declare a rebuild function
		function rebuild() {
			// ...the i is equal to the current index of the tree
			var i = index;
			
			// ...the new index is equal to the number of messages available for this task
			index = task.messages.length;
			
			// ...for every i
			for (i; i < index; i++) {
				// ...get a message
				var message = task.messages[i];
				
				// ...if message is SpiderWorker.data
				if (message.message_type == 'SpiderWorker.data') {
					// ...get the url of the request
					var url = Url.factory.new_from_url_object(message.request.url);
					
					// ...add the url of the request and the status of the response to the webtree 
					webtree.addUrl(url, message.response.status);
				}
			}
		}
		
		// ...rebuild
		rebuild();
		
		// ...rebuild every 1000ms
		setInterval(rebuild, 1000);
	}
}, true);