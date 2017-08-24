Polymer({
  is: 'planetCal-app',
  behaviors: [
    Polymer.IronResizableBehavior
  ],
  properties: {
    page: {
      type: String,
      reflectToAttribute: true,
      observer: '_pageChanged',
    },
  },

  observers: [
    '_routePageChanged(routeData.page)',
  ],

  listeners: {
    'on-cal-date-selected': '_calDateSelectHandler',
    'page-load-requested': '_pageLoadRequestHandler',
    'on-logout-requested': '_logoutRequestHandler',
    'on-login-successful': '_loginSuccessHandler',
    'status-message-update': '_messageUpdateHandler',
    'iron-resize': '_onIronResize',
    'on-query-param-changed': '_updateQueryParams'
  },

  ready: function () {
    console.log("Planetcal-app ready function called");
  },

  initializeLocalStorage: function () {
    this.localStorage = {
    }
  },

  _pageLoadRequestHandler: function (e) {
    this.set('route.path', e.detail.page);

    if (e.detail.page === '/events') {
      this.setQueryParamsForEventsPage();
    } else if (e.detail.queryParams) {
      this.queryParams = e.detail.queryParams;
    }
  },

  _logoutRequestHandler: function () {
    this.userId = '';
  },

  _loginSuccessHandler: function () {
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (this.localStorage && !loggedInUser) {
      loggedInUser = this.localStorage.loggedInUser;
    }

    if (loggedInUser) {
      this.userId = loggedInUser.id;
    }
    var userDetails = Polymer.globalsManager.globals.userDetails;
    if (this.localStorage && !userDetails) {
      userDetails = this.localStorage.userDetails;
    }

    var firstTimeLogon = true;
    if (userDetails && userDetails.name) {
      firstTimeLogon = false;
    }

    if (firstTimeLogon) {
      this.set('route.path', '/welcome');
    } else {
      //display events page
      this.setQueryParamsForEventsPage();
      this.set('route.path', '/events');
    }
  },

  setQueryParamsForEventsPage: function () {
    var selectedDate = Polymer.globalsManager.globals.selectedDate;
    var startDate = "" + selectedDate.year + "-" + selectedDate.month + "-" + selectedDate.day;
    var daysCount = Polymer.globalsManager.globals.daysCount;
    this.toggleEventsView = !this.toggleEventsView;
    this.queryParams = { startDate: startDate, daysCount: daysCount };
  },

  _routePageChanged: function (page) {
    this.page = page || 'events';

    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  },

  _pageChanged: function (page) {
    if (page !== 'events') {
      this.queryParams = {};
    }

    // Load page import on demand. Show 404 page if fails
    this.set('route.path', '/' + page)
    var resolvedPageUrl = this.resolveUrl('pages/' + page + '-page.html');
    this.importHref(resolvedPageUrl, null, this._showPage404, true);
  },

  _calDateSelectHandler: function (e) {
    this.setQueryParamsForEventsPage();
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
    this.toggleEventsView = !this.toggleEventsView;
  },

  onMessageStatusCloseHandler: function () {
    this.updateMessage();
  },

  _updateQueryParams: function (e) {
    this.queryParams = e.detail;
  },

  _messageUpdateHandler: function (e) {
    if (e.detail && e.detail.message) {
      this.updateMessage(e.detail.message, e.detail.severity);
    }
    else {
      this.updateMessage();
    }
  },
  updateMessage(message, severity) {
    if (message) {
      this.messageText = message;
      this.$.msg.style.display = 'block';

      switch (severity) {
        case ('info'):
          this.iconName = "icons:info"; //info
          this.$.severityIcon.style.color = "white";
          break;
        case ('warning'):
          this.iconName = "icons:warning"; //warning
          this.$.severityIcon.style.color = "yellow";
          break;
        case ('error'):
          this.iconName = "icons:highlight-off"; //error
          this.$.severityIcon.style.color = "white";
          break;
      }
    }
    else {
      this.messageText = "";
      this.$.msg.style.display = 'none';
    }
  },

  _showPage404: function () {
    this.page = 'view404';
  },
  _onIronResize: function () {
    //TODO: If we want to do any window resize at project level, add code here.
  },
});