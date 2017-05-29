Polymer({
  is: 'ask-groups',
  listeners: {
    '--cal-stepper-next-page-requested': 'forwardhandler',
    '--cal-stepper-previous-page-requested': 'previoushandler',
  },

  ready: function () {
    this.product = Polymer.globalsManager.globals.product.displayName;
  },

  previoushandler: function () {
    console.info(this.regionValue);
    console.info(this.city);
    this.fire('page-load-requested', { page: '/ask-location' });
  },

  forwardhandler: function () {
    this.fire('page-load-requested', { page: '/events' });
  },
});