Polymer({
    is: 'cal-settings',

    ready: function () {
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (loggedInUser) {
            this.name = loggedInUser.name;
            this.email = loggedInUser.email;
        }
    },

    saveSettingsHandler: function () {
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        ajax.headers['Version'] = '1.0';
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;

        if (loggedInUser) {
            var httpMethod = 'PUT'
            ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
            this.ajaxUrl = serviceBaseUrl + '/userdetails/' + loggedInUser.id;

            ajax.method = httpMethod;
            var groupsToSave = Polymer.globalsManager.globals.followingGroups;
            this.ajaxBody = JSON.stringify({
                id: loggedInUser.id,
                followingGroups: groupsToSave
            });
            ajax.generateRequest();
        }
        else {
            this.fire("status-message-update", { severity: 'error', message: 'Please login first' });
        }
    },

    handleAjaxResponse: function (e) {
        //var jsonResponse = e.detail.response;
        var userDetails = {
            id: this.id
        }

        Polymer.globalsManager.set('userDetails', userDetails);
        this.set('localStorage.userDetails', userDetails);
        this.fire("status-message-update", { severity: 'info', message: 'Settings saved!' });
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