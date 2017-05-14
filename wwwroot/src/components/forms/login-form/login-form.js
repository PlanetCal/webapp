Polymer({
  is: 'login-form',

  ready: function () {
    console.log('login-form ready function called!:');
    this.password_min_length = 4;
    this.name_min_length = 2;
    this.setViewsAsPerMode('login');  //other values: createAccount, findPassword
    this.$.email_status.style.display = 'none';
    this.$.password_status.style.display = 'none';
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
    this.$.msg.style.display = 'none';

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
        alert('It should not be possible');
    }
  },

  cancelOnclick: function () {
    this.fire('on-login-successul');
  },

  submitOnclick: function () {
    this.$.msg.style.display = 'block';
    this.messageText = '';
    if (this.mode === 'createAccount' && !this.isNameValid(this.name)) {
      this.messageText = 'Name should be at least ' + this.name_min_length + ' chars long.';
      return;
    }

    if (!this.isEmailValid(this.email)) {
      this.messageText = 'Email is not valid';
      return;
    }

    if (this.mode !== 'findPassword' && !this.isPasswordValid(this.password)) {
      this.messageText = 'Password should be at least ' + this.password_min_length + ' chars long.';
      return;
    }

    this.makeAjaxCall();
  },

  makeAjaxCall: function () {
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
    var req = e.detail.request;
    var jsonResponse = e.detail.request.xhr.response;
    switch (this.mode) {
      case 'login':
        var message = 'Login failed. Check your email or password. If you are a new user, please register first.';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText
        this.messageText = message;
        break;
      case 'findPassword':
        this.messageText = 'Not yet implemented';
        break;
      case 'createAccount':
        var message = 'Registration failed for some reason.';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText
        this.messageText = message;
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
          token: jsonResponse.token
        }

        Polymer.globalsManager.set('loggedInUser', loggedInUser);
        //this.set('localStorage.loggedUser', loggedInUser);  
        this.fire('on-login-successul');

        break;
      case 'findPassword':
        this.messageText = 'Check your email for the password';
        break;
      case 'createAccount':
        this.messageText = 'Registration successful. Please login now.';
        break;
    }
  },
});