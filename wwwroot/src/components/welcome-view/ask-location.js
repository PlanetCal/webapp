Polymer({
  is: 'ask-location',
  listeners: {
    '--cal-stepper-next-page-requested': 'forwardhandler',
    '--cal-stepper-previous-page-requested': 'previoushandler',
    '--on-country-changed': 'countryChangedHandler',
    '--on-region-changed': 'regionChangedHandler'
  },

  ready: function () {
    this.countryValue = "US";
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
    this.fire('page-load-requested', { page: '/welcome' });
  },

  forwardhandler: function () {
    this.fire('page-load-requested', { page: '/about' });
  },

  countryChangedHandler: function (e) {
    this.countryValue = e.detail.countryValue;
  },

  regionChangedHandler: function (e) {
    this.regionValue = e.detail.regionValue;
  },
});