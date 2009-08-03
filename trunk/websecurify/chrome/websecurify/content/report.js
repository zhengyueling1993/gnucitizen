/**
 * IMPORTS
 * code dependencies
 **/
Components.utils.import("resource://websecurify/content/mod/globals.jsm");

/**
 * ONLOAD
 * initialize window
 **/
window.addEventListener('load', function () {
	var task_name = window.arguments[0].task;
	
	var task = globals.tasks[task_name];
	
	if (task_name) {
		document.title = document.title + ' (' + task_name + ')';
		
		var index = 0;
		
		var $report_data = document.getElementById('report-data');
		var $report_pane = document.getElementById('report-pane');
		var $report_tree = document.getElementById('report-tree');
		
		function rebuild() {
			var i = index;
			
			index = task.messages.length;
			
			for (i; i < index; i++) {
				var message = task.messages[i];
				
				if (message.message_type == 'Reporter.data') {
					var title = message.title;
					var explanation = message.explanation;
					var description = message.description;
					
					var $issue = $report_data.getElementsByAttribute('title', title)[0];
					
					if (!$issue) {
						var $issue = document.createElement('issue');
						$issue.setAttribute('index', 0);
						$issue.setAttribute('title', title);
						$issue.setAttribute('description', explanation);
						
						$report_data.appendChild($issue);
					}
					
					var $variant = document.createElement('variant');
					$variant.setAttribute('title', 'Variant ' + (parseInt($issue.getAttribute('index'), 10) + 1));
					$variant.setAttribute('description', description);
					
					$issue.appendChild($variant);
					$issue.setAttribute('index', parseInt($issue.getAttribute('index'), 10) + 1);
				}
			}
			
			$report_pane.builder.rebuild();
			$report_tree.builder.rebuild();
		}
		
		rebuild();
		
		setInterval(rebuild, 1000);
		
		var report_tree_listener = {
			willRebuild: function (builder) {
				this.open_containers = [];
				
				for (var x = 0; x < builder.root.view.rowCount; x++) {
					if (builder.root.view.isContainer(x) && builder.root.view.isContainerOpen(x)) {
						this.open_containers.push(builder.root.view.getCellText(x, builder.root.columns['report-tree-treecols-title']));
					}
				}
				
				this.current_index = builder.root.currentIndex;
			},
			
			didRebuild: function (builder) {
				for (var y = 0; y < this.open_containers.length; y++) {
					for (var x = 0; x < builder.root.view.rowCount; x++) {
						if (builder.root.view.isContainer(x) && !builder.root.view.isContainerOpen(x)) {
							var title = builder.root.view.getCellText(x, builder.root.columns['report-tree-treecols-title']);
							
							if (title == this.open_containers[y]) {
								builder.root.view.toggleOpenState(x);
							}
						}
					}
				}
				
				builder.root.view.selection.select(this.current_index);
			},
		};
		
		$report_tree.builder.addListener(report_tree_listener);
	}
}, false);