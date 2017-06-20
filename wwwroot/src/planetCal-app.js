Polymer({
  is: 'planetCal-app',
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
    'status-message-update': '_messageUpdateHandler'
  },

  _pageLoadRequestHandler: function (e) {
    //console.log('_loginRequestHandler');
    this.set('route.path', e.detail.page)
  },

  _logoutRequestHandler: function () {
    this.userId = '';
  },

  _loginSuccessHandler: function () {
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      this.userId = loggedInUser.id;
    }
    var userDetails = Polymer.globalsManager.globals.userDetails;
    var firstTimeLogon = true;
    if (userDetails && userDetails.country) {
      firstTimeLogon = false;
    }

    if (firstTimeLogon) {
      this.set('route.path', '/welcome');
    } else {
      this.toggleEventsView = !this.toggleEventsView;
      this.set('route.path', '/events');
    }
  },

  _routePageChanged: function (page) {
    this.page = page || 'events';

    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  },

  _pageChanged: function (page) {
    // Load page import on demand. Show 404 page if fails
    this.set('route.path', '/' + page)
    var resolvedPageUrl = this.resolveUrl('pages/' + page + '-page.html');
    this.importHref(resolvedPageUrl, null, this._showPage404, true);
  },

  _calDateSelectHandler: function (e) {
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }

    this.toggleEventsView = !this.toggleEventsView;
  },

  _messageUpdateHandler: function (e) {
    if (e.detail && e.detail.message) {
      this.messageText = e.detail.message;
      this.$.msg.style.display = 'block';

      switch (e.detail.severity) {
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
});