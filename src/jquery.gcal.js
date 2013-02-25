(function($) {

	var gcalFeedPluginGlobal = {
		gcalFeedData : {},
		gcalEvents : {},
		monthDict : {
			0  : "JAN",
			1  : "FEB",
			2  : "MAR",
			3  : "APR",
			4  : "MAY",
			5  : "JUN",
			6  : "JUL",
			7  : "AUG",
			8  : "SEP",
			9  : "OCT",
			10 : "NOV",
			11 : "DEC"
		},
		pad2 : function (number) {
			return (number < 10 ? '0' : '') + number;
		},
		monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
		dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	};

	$.fn.gcalFeed = function (feed, options) {
		// calendar elements
		var $calEl = $(this);

		// Loading Template
		var loadingTmpl = "<li class='gc-loading'>\
							<div class='alert clearfix'>\
								<span class='gc-loading-txt'>Loading...</span>\
								<span class='gc-loading-img'></span>\
							</div>\
						  </li>";

		// Controls Template
		var monthPickTmpl = "<div id='gc-month-control' class='row'>\
								<div class='span3'>\
									<h3 id='gc-month-year-str'><%= date_string =%></h3>\
								</div>\
								<div class='span2 clearfix' id='gc-month-controls'>\
									<div class='btn-group'>\
										<button class='btn' id='gc-today-btn'>Today</button>\
										<button class='btn' id='gc-month-decrease'>&lt;</button>\
										<button class='btn' id='gc-month-increase'>&gt;</button>\
									</div>\
								</div>\
							</div>\
							<div class='row'>\
								<div class='event_shadow'></div>\
							</div>";

		// Modal body template
		var modalBodyTmpl = "<p><b>When:</b>&nbsp;<%= event_time %=></p>\
							 <p><b>Where:</b>&nbsp;<%= event_location %=>&nbsp\
							 	<a target='_blank' href='http://maps.google.com/maps?q=<%= event_location_url %=>&hl=en'>map</a>\
							 </p>\
							 <p><b>Description:</b> <%= event_desc %=></p>";

		//Event list Element
		var $calRow = $('<div />', {
			'class': 'row gc-cal-feed-wrap'
		}).appendTo($calEl);

		$('<ul/>',{
			'id' : 'gc-event-list-wrap',
			'class': 'gc-event-list'
		}).appendTo($calRow);

		var $calListEl = $('#gc-event-list-wrap');

		$calEl.append('<div class="event_shadow_btm"></div>');

		// match pattern for source url
		var gcalUrlPat = new RegExp(/^(http|https):\/\/www.google.com\/calendar\/feeds\//);

		// render event to string
		var renderEventToString = function (eventData) {
			var eventItem = '<li class="active gc-event-item clearfix" data-event-id="' + eventData.calId +'">';
			eventItem += '<div class="gc-event-date">';
			eventItem += '<span class="gc-event-day">' + eventData.day + '</span>'; 
			eventItem += '<span class="gc-event-month">' + gcalFeedPluginGlobal.monthDict[eventData.month] + '</span>';
			eventItem += '</div>';
			eventItem += '<div class="gc-event-title">';
			eventItem += eventData.title + '<br>' + eventData.where;
			eventItem += '</li>';

			return eventItem;
		};

		var renderEventItems = function (events) {
			$calListEl.html('');
			if (events.length > 0) {
				for (var i = 0; i < events.length; i++) {
					var eventInfo = events[i];

					var startTime = eventInfo.gd$when[0].startTime;
					var title = eventInfo.title.$t;
					var where = eventInfo.gd$where[0].valueString;
					var calId = eventInfo.gCal$uid.value;

					if (title.length > 31) {
						title = title.substring(0,28) + '...';
					}

					if (where.length > 31) {
						where = where.substring(0,28) + '...';
					}

					gcalFeedPluginGlobal.gcalFeedData[calId] = eventInfo;

					var eventDate = new Date(startTime);

					var eventTmplData = {
						'calId' : calId,
						'day'   : gcalFeedPluginGlobal.pad2(eventDate.getDate()),
						'month' : eventDate.getMonth(),
						'title' : title,
						'where' : where
					};

					var tmplString = renderEventToString(eventTmplData);

					$calListEl.append(tmplString);
				}
			} else {
				var noEventLi = '<li id="gc-no-events"><div class="alert">No Events This Month</div></li>';
				$calListEl.append(noEventLi);
			}
		};

		// default callback function
		var defaultCallbackFn = function (data) {

			var fetchedEvents = data.feed.entry;
			if (!fetchedEvents) {
				fetchedEvents = [];
			}
			gcalFeedPluginGlobal.gcalEvents[opts['start-min']] = fetchedEvents;
			
			renderEventItems(fetchedEvents);
		};

		// set up first and last day of current month
		var todayDate = new Date();

		var dateToString = function (date) {
			var month = date.getUTCMonth() + 1;
			var year = date.getUTCFullYear();
			var day = date.getUTCDate();

			var dateStr = year.toString() + "-" + gcalFeedPluginGlobal.pad2(month).toString() + "-" + gcalFeedPluginGlobal.pad2(day).toString();

			return dateStr;
		};

		var createStartDate = function(date) {
			var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

			return dateToString(firstDay) + "T00:00:00";
		};

		var createEndDate = function(date) {
			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

			return dateToString(lastDay) + "T23:59:59";
		};

		var convertTo12Hr = function (hour) {
			if (hour === 0) {
				return 12;
			} else if (hour > 12) {
				return hour - 12;
			} else {
				return hour;
			}
		};

		var parseMeridien = function (hour) {
			if (hour > 12) {
				return "pm";
			} else {
				return "am";
			}
		};

		var formatTimeStr = function (date) {
			var hour = convertTo12Hr(date.getHours());
			var meridien = parseMeridien(date.getHours());
			var timeStr = hour + ":" + gcalFeedPluginGlobal.pad2(date.getMinutes()) + meridien;

			return timeStr;
		};

		var dayOfWeekMonthTime = function (date) {
			var dayOfWeek = gcalFeedPluginGlobal.dayNames[date.getDay()];
			var month = gcalFeedPluginGlobal.monthNames[date.getMonth()];

			var dayOfWeekMonthStr = dayOfWeek + ", " + month + " " + date.getDate() + ", ";
			var timeStr = formatTimeStr(date);

			dayOfWeekMonthStr += timeStr;

			return dayOfWeekMonthStr;
		};

		var humanReadableDate = function(startDate, endDate) {
			var startMonth = startDate.getMonth();
			var startDay = startDate.getDate();
			var endMonth = endDate.getMonth();
			var endDay = endDate.getDate();

			var startMonthDayStr = startMonth + "-" + startDay;
			var endMonthDayStr = endMonth + "-" + endDay;

			if (startMonthDayStr === endMonthDayStr) {
				var startDayOfWeekMonthTimeStr = dayOfWeekMonthTime(startDate);
				var endTimeStr = formatTimeStr(endDate);

				startDayOfWeekMonthTimeStr += " - " + endTimeStr;

				return startDayOfWeekMonthTimeStr;
			} else {
				var startDayOfWeekMonthTimeStr = dayOfWeekMonthTime(startDate);
				var endDayOfWeekMonthTimeStr = dayOfWeekMonthTime(endDate);

				return startDayOfWeekMonthTimeStr + " - " + endDayOfWeekMonthTimeStr;
			}
		};

		//Default options
		var defaults = {
			'ctz' : '',
			'fields' : '',
			'futureevents' : false,
			'max-attendees' : '',
			'max-results': 9999,
			'orderby' : 'starttime',
			'recurrence-expansion-start' : '',
			'recurrence-expansion-end' : '',
			'singleevents' : true,
			'showdeleted' : false,
			'showhidden' : false,
			'sortorder' : 'ascending',
			'start-min' : createStartDate(todayDate),
			'start-max' : createEndDate(todayDate),
			'updated-min' : '',
			'callback' : defaultCallbackFn
		};

		var opts = $.extend(defaults, options);

		// Check that the feed was passed in
		if (feed === '' && !feed.match(gcalUrlPat)) {
			throw "Incorrect Google Calendar Feed Url";
		}

		// format feed url
		feed = feed.replace(/\/basic$/, '/full') + '?alt=json-in-script&callback=?';

		// format timezone
		if (opts.ctz) {
			opts.ctz = opts.ctz.replace(' ', '_');
		}

		var feedData = '';

		// extract callback
		var callbackFn = opts.callback;
		delete opts['callback'];

		// delete all keys that are empty
		for (key in opts) {
			if (!opts[key]) {
				delete opts[key];
			}
		}

		var fetchFeed = function () {
			var storedEvents = gcalFeedPluginGlobal.gcalEvents[opts['start-min']];

			if (storedEvents == [] || storedEvents === undefined) {
				var feedUrlCall = $.ajax({
					url: feed,
					dataType: 'jsonp',
					data : opts,
					startParam: false,
					endParam: false,
				});

				feedUrlCall.done(function(data) {
					callbackFn(data);
				});

				feedUrlCall.fail(function(data) {
					throw data;
				});
			} else {
				renderEventItems(storedEvents);
			}
		};

		var formatDatePickStr = function (date) {
			var month = gcalFeedPluginGlobal.monthNames[date.getMonth()];
			var year = date.getFullYear();

			var dateStr = month + " " + year;

			return dateStr;
		};

		var insertLoadingTmpl = function () {
			$calListEl.html('');

			$calListEl.append(loadingTmpl);
		};

		var fetchFeedDateChange = function (delta) {
			insertLoadingTmpl();

			var newDate = new Date(opts['start-min'])
									.add(1).days()
									.add(delta).months();
			
			opts['start-min'] = createStartDate(newDate);
			opts['start-max'] = createEndDate(newDate);

			$('#gc-month-year-str').text(formatDatePickStr(newDate));

			fetchFeed();
		};

		var init = function () {
			//Add Buttons
			var fetchDate = new Date(opts['start-min']).add(1).days();
			var dateStr = formatDatePickStr(fetchDate);
			var monthPickHtml = monthPickTmpl.replace('<%= date_string =%>', dateStr);

			$calEl.prepend(monthPickHtml);

			//Loading
			insertLoadingTmpl();

			// Fetch Feed
			fetchFeed();

			//Add Button Bindings
			$('#gc-month-decrease').click(function (){
				fetchFeedDateChange(-1);
			});

			$('#gc-month-increase').click(function (){
				fetchFeedDateChange(1);
			});

			$('#gc-today-btn').click(function () {
				insertLoadingTmpl();

				opts['start-min'] = createStartDate(todayDate);
				opts['start-max'] = createEndDate(todayDate);

				$('#gc-month-year-str').text(formatDatePickStr(todayDate));

				fetchFeed();
			});

			//Event Modal Bindigs
			$(document).on('click', '.gc-event-item', function () {
				var eventId = $(this).data('event-id');
				var eventInfo = gcalFeedPluginGlobal.gcalFeedData[eventId];

				if (eventInfo) {
					var title = eventInfo.title.$t;
					var startTime = new Date(eventInfo.gd$when[0].startTime);
					var endTime = new Date(eventInfo.gd$when[0].endTime);
					var eventLocation = eventInfo.gd$where[0].valueString;
					var eventLocationUrl = encodeURIComponent(eventLocation);
					var eventDesc = eventInfo.content.$t;
					var eventLink = eventInfo.link[0].href;

					$('#gc-event-modal-header').text(title);

					eventTimeStr = humanReadableDate(startTime, endTime);

					var modalBodyHtml = modalBodyTmpl.replace("<%= event_time %=>", eventTimeStr)
													.replace("<%= event_location %=>", eventLocation)
													.replace("<%= event_location_url %=>", eventLocationUrl)
													.replace("<%= event_desc %=>", eventInfo.content.$t);

					$('#gc-event-modal-body').html(modalBodyHtml);
					$('#gc-event-modal-link').attr('href', eventLink);

					$('#gc-event-modal').modal();
				}
			});
		};

		// Initialize calendar feed
		init();
	};

})(jQuery);
