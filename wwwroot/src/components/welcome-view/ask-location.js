Polymer({
  is: 'ask-location',
  listeners: {
    '--cal-stepper-next-page-requested': 'forwardhandler',
    '--cal-stepper-previous-page-requested': 'previoushandler',
    '--on-country-changed': 'countryChangedHandler',
    '--on-region-changed': 'regionChangedHandler',
    '--on-city-changed': 'cityChangedHandler',
  },

  ready: function () {
    this.countryValue = "";
    this.regionValue = "";
    this.city = "";

    var userDetails = Polymer.globalsManager.globals.userDetails;
    if (userDetails && userDetails.name) {
      this.countryValue = userDetails.country;
      this.city = userDetails.city;
      this.regionValue = userDetails.region;
    }

    this.product = Polymer.globalsManager.globals.product.displayName;
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;

    if (loggedInUser) {
      this.name = loggedInUser.name;
    }
    else {
      this.name = 'guest';
    }
  },

  previoushandler: function () {
    this.makeAjaxCall();
    this.navigation = 'previous';
  },

  forwardhandler: function () {
    this.makeAjaxCall();
    this.navigation = 'forward';
  },

  countryChangedHandler: function (e) {
    this.countryValue = e.detail.countryValue;
  },

  regionChangedHandler: function (e) {
    this.regionValue = e.detail.regionValue;
  },

  cityChangedHandler: function (e) {
    this.city = e.detail.cityValue;
  },

  makeAjaxCall: function () {
    var userDetails = Polymer.globalsManager.globals.userDetails;

    var firstTimeLogon = true;
    if (userDetails && userDetails.name) {
      firstTimeLogon = false;
    }
    var ajax = this.$.ajax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
    this.ajaxUrl = serviceBaseUrl + '/userdetails';
    ajax.headers['Version'] = '1.0';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;

      if (firstTimeLogon == false) {
        var httpMethod = 'PUT'
        this.ajaxUrl = this.ajaxUrl + '/' + loggedInUser.id;
      }
      else {
        var httpMethod = 'POST'
      }

      ajax.method = httpMethod;

      this.ajaxBody = JSON.stringify({
        id: loggedInUser.id,
        name: loggedInUser.name,
        country: this.countryValue,
        region: this.regionValue,
        city: this.city
      });

      ajax.generateRequest();
    }
    else {
      this.fire("status-message-update", { severity: 'error', message: 'Please login first' });
    }

  },

  handleAjaxResponse: function (e) {
    var jsonResponse = e.detail.response;
    var userDetails = {
      name: this.name,
      country: this.countryValue,
      region: this.regionValue,
      city: this.city
    }
    Polymer.globalsManager.set('userDetails', userDetails);
    this.set('localStorage.userDetails', userDetails);

    if (this.navigation === 'forward') {
      this.fire('page-load-requested', { page: '/ask-groups' });
    }
    else if (this.navigation === 'previous') {
      this.fire('page-load-requested', { page: '/welcome' });
    }
  },

  handleErrorResponse: function (e) {
    var req = e.detail.request;
    var jsonResponse = e.detail.request.xhr.response;
    this.displayErrorMessage(jsonResponse);
  },

  displayErrorMessage: function (errorResponse) {
    var message = '';
    if (errorResponse !== null) {
      switch (errorResponse.errorcode) {
        case 'GenericHttpRequestException':
          message = 'Oh! ohh! Looks like there is some internal issue. Please try again after some time.';
          break;
        default:
          message = errorResponse.errorcode + ' has not been handled yet.';
          break;
      }
    } else {
      message = 'Something went wrong. Check if there is any CORS error.';
    }
    this.fire("status-message-update", { severity: 'error', message: message });
  },
});