Polymer({
  is: 'user-settings',

  properties: {
    userId: {
      type: String,
      reflectToAttribute: true,
      observer: '_userIdChanged'
    }
  },

  ready: function () {
    this._initialize();
  },

  _initialize: function () {
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      this.userName = loggedInUser.name;
      this.userId = loggedInUser.id;
      this.email = loggedInUser.email;
      this.userProfileLink = '/user-profile';
    }
    else {
      this.userProfileLink = '';
    }

    if (this.userId) {
      //console.log('user-settings ready called with userId existing !:');
      this.loginOrLogout = 'Sign out';
    } else {
      //console.log('user-settings ready called with userId not existing !:');
      this.userName = '';
      this.loginOrLogout = 'Sign in';
    }
  },

  settingsClickHandler: function () {
    if (!this.userId) {
      this.fire("status-message-update", { severity: 'error', message: "Please log-in first." });
    }
  },

  _userIdChanged: function () {
    this._initialize();
  },

  _loginOrLogoutHandler: function (page) {
    if (this.userId) {
      //this.set('localStorage.loggedUser', null); 
      Polymer.globalsManager.set('loggedInUser', null);
      this.email = null;
      this.userId = null;
      this.userName = '';
      this.loginOrLogout = 'Sign in';
      this.fire('on-logout-requested');
    } else {
      this.fire('page-load-requested', { page: '/login' });
    }
  }
});