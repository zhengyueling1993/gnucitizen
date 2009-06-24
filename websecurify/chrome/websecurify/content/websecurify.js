Components.utils.import("resource://websecurify/mod/globals.jsm");

var prompts = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
                        .getService(Components.interfaces.nsIPromptService);

var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                         .getService(Components.interfaces.nsIWindowMediator);

$(document).ready(function () {
	$('input[name="target_url"]').focus(function () {
		if ($(this).val() == $(this).attr('original_value')) {
			$(this).val('');
		}
	});
	
	$('input[name="target_url"]').blur(function () {
		if ($.trim($(this).val()) == '') {
			$(this).val($(this).attr('original_value'));
		}
	});
	
	function start() {
		var $target  = $('input[name="target_url"]');
		var target = $.trim($target.val());
		
		if (target == '' || target == $target.attr('original_value') || !target.match(/^\w+?:\/\/.+/i)) {
			return prompts.alert(null, 'Websecurify', 'Please specify a valid target');
		}
		
		if (!prompts.confirm(null, 'Websecurify', 'CMA: By using this tool, you claim ownership (or permission) of the site being tested as required by the computer misuse act 1990.')) {
			return false;
		}
		
		globals.initiate_engine(target);
		
		$('form[name="scanner"]').fadeOut(300, function () {
			var win = mediator.getMostRecentWindow('websecurify:tasks');
			
			if (!win) {
				window.open('chrome://websecurify/content/tasks.xul', '', 'menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,chrome');
			} else {
				win.focus();
			}
			
			$target.val('');
			$target.blur();
			
			$('form[name="scanner"]').fadeIn(300);
		});
		
		return false;
	}

	$('form[name="scanner"]').submit(start);
	$('input[name="scan"]').click(start);
});