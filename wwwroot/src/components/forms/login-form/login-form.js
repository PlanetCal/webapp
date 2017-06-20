Polymer({
  is: 'login-form',

  ready: function () {
    console.log('login-form ready function called!:');
    this.fire("status-message-update");
    this.password_min_length = 4;
    this.name_min_length = 2;
    this.setViewsAsPerMode('login');  //other values: createAccount, findPassword
    this.$.email_status.style.display = 'none';
    this.$.password_status.style.display = 'none';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      this.name = loggedInUser.name;
    }
    else {
      this.name = 'guest';
    }
  },

  isNameValid: function (name) {
    return name.length >= parseInt(this.name_min_length)
  },

  isEmailValid: function (email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  },

  isPasswordValid: function (pwd) {
    return pwd.length >= parseInt(this.password_min_length)
  },

  //validating email
  emailOnkeyup: function () {
    this.$.email_status.style.display = 'block';
    this.emailStatusIcon = this.isEmailValid(this.email) ? 'icons:done' : 'icons:error-outline';
  },

  //validating password
  passwordOnkeyup: function () {
    this.$.password_status.style.display = 'block';
    this.passwordStatusIcon = this.isPasswordValid(this.password) ? 'icons:done' : 'icons:error-outline';
  },

  linkClickHandler: function (e) {
    this.setViewsAsPerMode(e.currentTarget.id);
  },

  setViewsAsPerMode: function (mode) {
    this.mode = mode;
    this.fire("status-message-update");
    switch (this.mode) {
      case 'login':
        this.titleText = 'Login';
        this.$.nameFieldDiv.style.display = 'none';
        this.$.loginLinkDiv.style.display = 'none';
        this.sumbitButtonText = 'Login';
        this.$.passwordInputDiv.style.display = 'block';
        this.$.forgotAccountLinkDiv.style.display = 'block';
        this.$.createAccountLinkDiv.style.display = 'block';
        break;
      case 'findPassword':
        this.$.nameFieldDiv.style.display = 'none';
        this.$.loginLinkDiv.style.display = 'block';
        this.$.forgotAccountLinkDiv.style.display = 'none';
        this.$.createAccountLinkDiv.style.display = 'none';
        this.$.passwordInputDiv.style.display = 'none';
        this.sumbitButtonText = 'Email me';
        this.titleText = 'Find password';
        break;
      case 'createAccount':
        this.$.nameFieldDiv.style.display = 'block';
        this.$.loginLinkDiv.style.display = 'block';
        this.$.forgotAccountLinkDiv.style.display = 'none';
        this.$.createAccountLinkDiv.style.display = 'none';
        this.sumbitButtonText = 'Signup';
        this.titleText = 'Create Account';
        break;
      default:
        this.fire("status-message-update", { severity: 'error', message: 'It should not be possible' });
    }
  },

  cancelOnclick: function () {
    this.fire('on-login-successful');
  },

  submitOnclick: function () {

    if (this.mode === 'createAccount' && !this.isNameValid(this.name)) {
      this.fire("status-message-update", { severity: 'error', message: 'Name should be at least ' + this.name_min_length + ' chars long.' });
      return;
    }

    if (!this.isEmailValid(this.email)) {
      this.fire("status-message-update", { severity: 'error', message: 'Email is not valid' });
      return;
    }

    if (this.mode !== 'findPassword' && !this.isPasswordValid(this.password)) {
      this.fire("status-message-update", { severity: 'error', message: 'Password should be at least ' + this.password_min_length + ' chars long.' });
      return;
    }

    this.makeLoginAjaxCall();
  },

  makeLoginAjaxCall: function () {
    var ajax = this.$.ajax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;

    switch (this.mode) {
      case 'login':
        this.ajaxUrl = serviceBaseUrl + '/login';
        this.ajaxBody = JSON.stringify({ email: this.email, password: this.password });
        ajax.method = 'POST';
        ajax.headers['Version'] = '1.0';
        break;
      case 'findPassword':
        break;
      case 'createAccount':
        this.ajaxUrl = serviceBaseUrl + '/userauth';
        this.ajaxBody = JSON.stringify({ email: this.email, password: this.password, name: this.name });
        ajax.method = 'POST';
        ajax.headers['Version'] = '1.0';
        break;
    }

    ajax.generateRequest();
  },

  handleErrorResponse: function (e) {
    var jsonResponse = e.detail.request.xhr.response;
    switch (this.mode) {
      case 'login':
      case 'createAccount':
        this.displayErrorMessage(jsonResponse);
        break;
      case 'findPassword':
        his.fire("status-message-update", { severity: 'warning', message: 'Not yet implemented' });
        break;
    }
  },

  handleAjaxResponse: function (e) {
    var jsonResponse = e.detail.response;
    switch (this.mode) {
      case 'login':
        this.name = jsonResponse.name;

        var loggedInUser = {
          name: this.name,
          email: this.email,
          id: jsonResponse.id,
          token: jsonResponse.token,
          firstTimeLogon: jsonResponse.firstTimeLogon,
        }

        Polymer.globalsManager.set('loggedInUser', loggedInUser);
        //this.set('localStorage.loggedUser', loggedInUser);  
        this.getUserDetailsAjaxCall();
        break;
      case 'findPassword':
        this.fire("status-message-update", { severity: 'info', message: 'We sent you the password in your email. Please check.' });
        break;
      case 'createAccount':
        this.fire("status-message-update", { severity: 'info', message: 'Registration successful. Please login now.' });
        break;
    }
  },

  displayErrorMessage: function (errorResponse) {
    var message = '';
    if (errorResponse !== null) {
      switch (errorResponse.errorcode) {
        case 'LoginFailed':
          message = 'Login failed. Check your email or password. If you are a new user, please register.';
          break;
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

  getUserDetailsAjaxCall: function () {
    var ajax = this.$.userDetailsAjax;
    var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
    ajax.method = 'GET';
    ajax.headers['Version'] = '1.0';
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
      this.userDetailsAjaxUrl = serviceBaseUrl + '/userdetails/' + loggedInUser.id;
      ajax.generateRequest();
    } else {
      // Impossible to arrive at this point given that it is only called after user has logged in.
      this.fire("status-message-update", { severity: 'error', message: 'User is not logged in. Can not get User details.' });
    }
  },

  handleUserDetailsErrorResponse: function (e) {
    console.log("User details get failed");
    var userDetailsJsonResponse = e.detail.request.xhr.response;
    this.displayErrorMessage(userDetailsJsonResponse);
  },

  handleUserDetailsAjaxResponse: function (e) {
    console.log("User details get succeeded");
    var userDetailsJsonResponse = e.detail.response;
    if (userDetailsJsonResponse.name) {
      var userDetails = {
        name: userDetailsJsonResponse.name,
        country: userDetailsJsonResponse.country,
        region: userDetailsJsonResponse.region,
        city: userDetailsJsonResponse.city
      }
      Polymer.globalsManager.set('userDetails', userDetails);
    }

    this.fire('on-login-successful');
  }
});