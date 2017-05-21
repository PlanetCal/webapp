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
    'on-login-requested': '_loginRequestHandler',
    'on-logout-requested': '_logoutRequestHandler',
    'on-login-successul': '_loginSuccessHandler',
    'localeInfo-requested': '_localeInfoHandler'
  },

  _loginRequestHandler: function () {
    //console.log('_loginRequestHandler');
    this.set('route.path', '/login')
  },

  _localeInfoHandler: function () {
    //console.log('_loginRequestHandler');
    this.set('route.path', '/about-us')
  },

  _logoutRequestHandler: function () {
    this.userId = '';
  },

  _loginSuccessHandler: function () {
    var firstTimeLogon = false;
    var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
    if (loggedInUser) {
      this.userId = loggedInUser.id;
      firstTimeLogon = loggedInUser.firstTimeLogon;
    }

    if (firstTimeLogon) {
      this.set('route.path', '/welcome');
    } else {
      this.set('route.path', '/events');
      this.toggleEventsView = !this.toggleEventsView;
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

  _showPage404: function () {
    this.page = 'view404';
  },
});