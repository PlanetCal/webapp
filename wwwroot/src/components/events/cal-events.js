Polymer({
  is: 'cal-events',

  listeners: {
    'search-pressed': 'searchPressedHandler',
  },

  properties: {
    toggleView: {
      type: Boolean,
      observer: '_dateChanged'
    }
  },

  ready: function () {
    this._dateChanged();
  },

  searchPressedHandler: function (e) {
    var tempData = this.masterData;
    this.searchText = e.detail.searchInput.toLowerCase();
    if (this.searchText !== '') {
      var newData = []; //new bucket
      for (var i = 0; i < tempData.length; i++) {
        var venue = this.getVenue(tempData[i].groups);
        if ((tempData[i].name.toLowerCase().indexOf(this.searchText) >= 0) ||
          (tempData[i].description.toLowerCase().indexOf(this.searchText) >= 0) ||
          (venue.toLowerCase().indexOf(this.searchText) >= 0)) {
          newData.push(tempData[i]);
        }
      }
      this.data = newData;
    } else {
      this.data = this.masterData;
    }
  },

  _dateChanged: function () {

    var dateChanged = false;

    var selectedDate = Polymer.globalsManager.globals.selectedDate;
    if (selectedDate) {
      this.selectedDay = selectedDate.day;
      this.selectedMonth = selectedDate.month;
      this.selectedYear = selectedDate.year;

      if (selectedDate !== this._currentSelectedDate) {
        dateChanged = true;
      }
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

  makeAjaxCall: function () {
    var ajax = this.$.ajax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
    this.ajaxUrl = serviceBaseUrl + '/events';
    ajax.method = 'GET';
    ajax.headers['Version'] = '1.0';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;

    if (loggedInUser) {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
    }
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
    this.masterData = this.data;
  },

  getDate: function (date) {
    var dateTime = new Date(date);
    return dateTime.toDateString();
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