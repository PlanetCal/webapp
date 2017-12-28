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
    this.makeAjaxCall();
    this.navigation = 'previous';
  },

  forwardhandler: function () {
    this.makeAjaxCall();
    this.navigation = 'forward';
  },

  makeAjaxCall: function () {

    var ajax = this.$.ajax;
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
      ajax.method = 'PUT';
      var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
      this.ajaxUrl = serviceBaseUrl + '/userdetails/' + loggedInUser.id;
      ajax.headers['Version'] = '1.0';

      var groupsToSave = Polymer.globalsManager.globals.followingGroups;
      var userDetails = Polymer.globalsManager.globals.userDetails;
      userDetails.id = loggedInUser.id;
      userDetails.followingGroups = groupsToSave;

      this.ajaxBody = JSON.stringify(userDetails);
      ajax.generateRequest();
    }
    else {
      this.fire("status-message-update", { severity: 'error', message: 'Please login first' });
    }
  },

  handleAjaxResponse: function (e) {
    if (this.navigation === 'forward') {
      this.fire('page-load-requested', { page: '/events' });
    }
    else if (this.navigation === 'previous') {
      this.fire('page-load-requested', { page: '/ask-location' });
    }
  },

  handleErrorResponse: function (e) {
    var req = e.detail.request;
    var jsonResponse = e.detail.request.xhr.response;
    this.displayErrorMessage(jsonResponse);
  },

  displayErrorMessage: function (errorResponse) {
    var message = '';
    if (errorResponse !== null) {
      switch (errorResponse.errorcode) {
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
});