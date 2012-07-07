$(document).ready(function () {
	function escapeHTML(t) {
		var div = document.createElement('div');
		var text = document.createTextNode(t);

		div.appendChild(text);

		return div.innerHTML;
	}

	$('a[rel~="inline-text"]').each(function (i, t) {
		var h = $(t).attr('href');

		$.ajax({url: h, success: function (d) {
			$(t).before(escapeHTML(d));
			$(t).remove();
		}});
	});

	$('a[rel~="inline-html"]').each(function (i, t) {
		var h = $(t).attr('href');

		$.ajax({url: h, success: function (d) {
			$(t).before(d);
			$(t).remove();
		}});
	});
});
