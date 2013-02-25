jQuery.gcal.js
==================

#### Requires
- jQuery ( no minimum version identified yet )
- datejs [http://www.datejs.com/](http://www.datejs.com/)
- Bootstrap Modal (used for clicking an event item)

A Jquery Plugin for getting a google calendar feed from url

```html
<div class="container">
	<div class="span5" id="calendar"></div>
</div>

<!-- Modal -->
<div id="gc-event-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3 id="gc-event-modal-header"></h3>
  </div>
  <div class="modal-body" id="gc-event-modal-body"></div>
  <div class="modal-footer">
    <a class="btn btn-primary" id="gc-event-modal-link" target="_blank">Add Event To Calendar</a>
  </div>
</div>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
<script type="text/javascript" src="date.min.js"></script>
<script type="text/javascript" src="bootstrap-modal.js"></script>
<script type="text/javascript" src="jquery.gcal.min.js"></script>
<script>
	$(function() {
		var calUrl = 'http://www.google.com/calendar/feeds/developer-calendar@google.com/public/full'

		$('#calendar').gcalFeed(calUrl);
	});
</script>
```

[Download](https://raw.github.com/billpull/jquery.gcal/master/build/jquery.gcal.min.js)

**License**: MIT [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)