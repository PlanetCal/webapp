Polymer({
  is: 'cal-events',

  listeners: {
    'search-pressed': 'searchPressedHandler',
  },

  properties: {
    toggleView: {
      type: Boolean,
      observer: '_dateChanged'
    },
    startDate: {
      type: String,
    },
    daysCount: {
      type: Number,
    }
  },

  ready: function () {
    this._dateChanged();
  },

  searchPressedHandler: function (e) {
    var allEvents = this.eventsFromServer;
    var searchText = e.detail.searchInput.trim().toLowerCase();
    if (searchText !== '') {
      var splitText = searchText.split(' ');
      var filteredEvents = [] //new array to store search result
      for (var i = 0; i < allEvents.length; i++) {
        if (this.eventMatchesSearch(allEvents[i], splitText)) {
          filteredEvents.push(allEvents[i]);
        }
      }

      this.data = filteredEvents;
    } else {
      this.data = this.eventsFromServer;
    }
  },

  eventMatchesSearch: function (currentEvent, searchWordsArray) {
    var eventVenue = this.getVenue(currentEvent.groups).toLowerCase();
    var eventName = currentEvent.name.toLowerCase();
    var eventDescription = currentEvent.description.toLowerCase();
    var eventName = currentEvent.name.toLowerCase();

    for (var r = 0; r < searchWordsArray.length; r++) {
      if (searchWordsArray[r] !== '' &&
        (eventName.indexOf(searchWordsArray[r]) >= 0) ||
        (eventDescription.indexOf(searchWordsArray[r]) >= 0) ||
        (eventVenue.indexOf(searchWordsArray[r]) >= 0)) {
        return true;
      }
    }
    return false;
  },

  _dateChanged: function () {

    var dateChanged = false;
    console.log('startDate ' + this.startDate);
    console.log('daysCount ' + this.daysCount);
    var selectedDate = null;
    if (this.startDate) {
      var array = this.startDate.split('-');
      if (array.length == 3) {
        selectedDate = { year: array[0], month: array[1], day: array[2] };
      }
    }
    if (!selectedDate) {
      selectedDate = Polymer.globalsManager.globals.selectedDate;
    }

    if (selectedDate) {
      this.selectedDay = selectedDate.day;
      this.selectedMonth = selectedDate.month;
      this.selectedYear = selectedDate.year;

      dateChanged = !this.areDatesEqual(selectedDate, this._currentSelectedDate);
    }

    this._currentSelectedDate = selectedDate;

    var loggedinUserChanged = false;
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;

    if (loggedInUser) {
      if (loggedInUser !== this._currentLoggedInUser) {
        loggedinUserChanged = true;
      }
    }
    this._currentLoggedInUser = loggedInUser;

    if (dateChanged || loggedinUserChanged) {
      this.fire("status-message-update");
      this.makeAjaxCall();
    }
  },

  areDatesEqual(date1, date2) {

    if (!date1 || !date2) {
      return false;
    }

    return date1.day == date2.day &&
      date1.month == date2.month &&
      date1.year == date2.year;
  },

  makeAjaxCall: function () {
    var ajax = this.$.ajax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
    ajax.method = 'GET';
    ajax.headers['Version'] = '1.0';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;

    var queryMonth = Number.parseInt(this.selectedMonth);
    var queryDay = Number.parseInt(this.selectedDay);
    var queryMonthString = (queryMonth > 9) ? queryMonth.toString() : '0' + this.selectedMonth.toString();
    var queryDayString = (queryDay > 9) ? queryDay.toString() : '0' + queryDay.toString();
    var queryDateTimeFilter = '?filter=endDateTime>=' + this.selectedYear + '-' + queryMonthString + '-' + queryDayString;

    if (loggedInUser) {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
      this.ajaxUrl = serviceBaseUrl + '/events';
    }
    else {
      this.ajaxUrl = serviceBaseUrl + '/eventsanonymous';
    }

    this.ajaxUrl += queryDateTimeFilter;
    this.ajaxUrl += '&fields=name|description|startDateTime|endDateTime|address|location|groupId|icon';

    this.fire("status-message-update", { severity: 'info', message: 'Loading events from server ...' });
    ajax.generateRequest();
  },

  handleErrorResponse: function (e) {
    console.log('cal-events got error from ajax!');

    var req = e.detail.request;
    var errorResponse = e.detail.request.xhr.response;
    message = 'Error in fetching events. Check if you are logged in.';
    if (errorResponse !== null) {

      switch (errorResponse.errorcode) {
        case 'GenericHttpRequestException':
          message = 'Oh! ohh! Looks like there is some internal issue. Please try again after some time.';
          break;
        default:
          message = errorResponse.errorcode + ' has not been handled yet.';
          break;
      }
    }

    this.fire("status-message-update", { severity: 'error', message: message });
  },

  handleAjaxResponse: function (e) {
    console.log('cal-events got success from ajax!');
    this.fire("status-message-update");

    this.data = e.detail.response;
    this.eventsFromServer = this.data;
  },

  getDate: function (date) {
    var dateTime = new Date(date);
    return dateTime.toDateString();
  },

  getImage: function (item) {
    return (item.icon) ? item.icon : '/src/images/about.jpg';
  },

  getVenue: function (item) {
    if (item && item[0]) {
      return item[0].name;
    } else {
      return '';
    }
  },

  getVenueLink: function (item) {
    if (item && item[0]) {
      return item[0].webSite;
    } else {
      return '';
    }
  },

  getDuration: function (dateStart, dateEnd) {
    var startdateTime = new Date(dateStart);
    var endDateTime = new Date(dateEnd);
    var timeDiff = Math.abs(endDateTime.getTime() - startdateTime.getTime());

    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays + " Days";
  },
});