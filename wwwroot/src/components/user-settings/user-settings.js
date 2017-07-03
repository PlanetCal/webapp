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
    console.log("User-settings ready function called");
    this._initialize();
  },

  _onLocalStorageLoad: function () {
    this._initialize();
  },

  _initialize: function () {
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (this.localStorage && !loggedInUser) {
      loggedInUser = this.localStorage.loggedInUser;
      Polymer.globalsManager.set('loggedInUser', loggedInUser);
    }

    if (loggedInUser) {
      this.userName = loggedInUser.name;
      this.userId = loggedInUser.id;
      this.email = loggedInUser.email;
      this.userProfileLink = '/user-profile';
      this.changePasswordLink = '/change-password';
    }
    else {
      this.userProfileLink = '';
      this.changePasswordLink = '';
    }

    if (this.userId) {
      //console.log('user-settings ready called with userId existing !:');
      this.loginOrLogout = 'Sign out';
    } else {
      //console.log('user-settings ready called with userId not existing !:');
      this.userName = '';
      this.loginOrLogout = 'Sign in';
    }

    var userDetails = Polymer.globalsManager.globals.userDetails;
    if (this.localStorage && !userDetails) {
      userDetails = this.localStorage.userDetails;
      Polymer.globalsManager.set('userDetails', userDetails);
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
      this.set('localStorage.loggedInUser', null);
      Polymer.globalsManager.set('loggedInUser', null);
      this.set('localStorage.userDetails', null);
      Polymer.globalsManager.set('userDetails', null);

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