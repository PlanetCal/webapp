Polymer({
  is: 'welcome-view',

  ready: function () {
    this.product = Polymer.globalsManager.globals.product.displayName;
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      this.name = loggedInUser.name;
    }
    else {
      this.name = 'guest';
    }
  },
});