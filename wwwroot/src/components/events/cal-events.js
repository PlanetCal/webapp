Polymer({
  is: 'cal-events',

  properties: {
    toggleView: {
      type: Boolean,
      observer: '_dateChanged'
    }
  },

  ready: function () {
    this._dateChanged();
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
      this.messageText = '';
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

    this.messageText = 'Loading events from server ...';
    ajax.generateRequest();

  },

  handleErrorResponse: function (e) {
    console.log('cal-events got error from ajax!');

    var req = e.detail.request;
    var errorResponse = e.detail.request.xhr.response;
    message = 'Error in fetching events. Check if you are logged in.';
    if (errorResponse !== null) {

      switch (errorResponse.errorcode) {
        case 'LoginFailed':
          message = 'Login failed. Check your email or password. If you are a new user, please register.';
          break;

        case 'GenericHttpRequestException':
        default:
          message = 'Oh! ohh! Looks like there is some internal issue. Please try again after some time.';
          break;
      }
    }

    this.$.msg.style.display = 'block';
    this.messageText = message;
  },

  handleAjaxResponse: function (e) {
    console.log('cal-events got success from ajax!');
    this.messageText = '';

    this.data = e.detail.response;
  },

  getDate: function (date) {
    var dateTime = new Date(date);
    return dateTime.toDateString();
  },

  getVenue: function (item) {
    return item[0].Name;
  },

  getVenueLink: function (item) {
    return item[0].WebSite;
  },

  getDuration: function (dateStart, dateEnd) {
    var startdateTime = new Date(dateStart);
    var endDateTime = new Date(dateEnd);
    var timeDiff = Math.abs(endDateTime.getTime() - startdateTime.getTime());

    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays + " Days";
  },
});