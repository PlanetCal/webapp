Polymer({
  is: 'welcome-view',
  listeners: {
    '--cal-stepper-next-page-requested': 'forwardhandler'
  },

  ready: function () {
    this.fire("status-message-update");
    this.product = Polymer.globalsManager.globals.product.displayName;
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;

    if (loggedInUser) {
      this.name = loggedInUser.name;
    }
    else {
      this.name = 'guest';
    }
  },

  forwardhandler: function () {
    this.fire('page-load-requested', { page: '/ask-location' });
  },
});