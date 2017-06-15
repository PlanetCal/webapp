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
    console.info(this.regionValue);
    console.info(this.city);
    this.makeAjaxCall();
    this.fire('page-load-requested', { page: '/welcome' });
  },

  forwardhandler: function () {
    this.makeAjaxCall();
    this.fire('page-load-requested', { page: '/ask-groups' });
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
    var ajax = this.$.ajax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
    this.ajaxUrl = serviceBaseUrl + '/userdetails';
    ajax.method = 'POST';
    ajax.headers['Version'] = '1.0';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;

      this.ajaxBody = JSON.stringify({
        id: loggedInUser.id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        country: this.countryValue,
        region: this.regionValue,
        city: this.city
      });

      ajax.generateRequest();
    }
    else {
      //alert("please login first")
      //to do: add error handling
    }

  },

  handleAjaxResponse: function (e) {
    var jsonResponse = e.detail.response;
  },

  handleErrorResponse: function (e) {
    var req = e.detail.request;
    var jsonResponse = e.detail.request.xhr.response;
    //to do: add error handling

  },




});