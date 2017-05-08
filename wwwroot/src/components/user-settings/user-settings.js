Polymer({
  is: 'user-settings',

 properties: {

  userId: {
    type: String,
    reflectToAttribute: true,
    observer: '_userIdChanged'
  }
 },

  ready: function() {
    this._initialize();
  },
  
  _initialize: function(){
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser)
    {
      this.userName = loggedInUser.name;
      this.userId = loggedInUser.id;
      this.email = loggedInUser.email;
    }
  
    if (this.userId){
			//console.log('user-settings ready called with userId existing !:');
      this.loginOrLogout = 'Logout';
    } else {
			//console.log('user-settings ready called with userId not existing !:');
      this.userName = 'Guest';
      this.loginOrLogout = 'Login';
    }
  },

  _userIdChanged: function() {
    this._initialize();
  },

  _loginOrLogoutHandler: function(page) {
    if (this.userId) {
        //this.set('localStorage.loggedUser', null); 
        Polymer.globalsManager.set('loggedInUser', {});
        this.email = null;
        this.userId = null;
        this.userName = 'Guest';
        this.loginOrLogout = 'Login';
        this.fire('on-logout-requested');
    } else {
      this.fire('on-login-requested');
    }
  }  
});