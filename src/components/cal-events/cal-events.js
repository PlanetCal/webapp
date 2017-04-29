Polymer({
  is: 'cal-events',

  properties: {
				toggleView: {
            type: Boolean,
           	observer: '_dateChanged'
        }
      },

       ready: function() {
        this._dateChanged();
      },

      _dateChanged: function() {

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
        if (loggedInUser)
        {
          if (loggedInUser !== this._currentLoggedInUser) {
            loggedinUserChanged = true;
          }
        }
        this._currentLoggedInUser = loggedInUser;

        if (dateChanged || loggedinUserChanged) {
          this.makeAjaxCall();
        }
    },

    makeAjaxCall: function() {
    var ajax = this.$.ajax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
    this.ajaxUrl= serviceBaseUrl + '/events';
    ajax.method = 'GET'; 
    ajax.headers['Version'] = '1.0';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser)
    {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
    }

    console.log('cal-events fetching data through ajax call!');
    ajax.generateRequest();
    
  },

  handleErrorResponse: function (e) {
    console.log('cal-events got error from ajax!');

    var req = e.detail.request;
    var jsonResponse = e.detail.request.xhr.response;
    var message = 'Login failed. Check your email or password. If you are a new user, please register first.';
    message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText
    this.messageText = message;
  },

  handleAjaxResponse: function (e) {
    console.log('cal-events got success from ajax!');

    var jsonResponse = e.detail.response;
    this.name = jsonResponse.name;

    var loggedInUser = {
      name: this.name,
      email: this.email,
      id: jsonResponse.id,
      token: jsonResponse.token
    }

    Polymer.globalsManager.set('loggedInUser', loggedInUser);
    //this.fire('on-login-successul');
  },
});