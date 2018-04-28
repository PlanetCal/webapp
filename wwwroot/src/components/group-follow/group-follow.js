Polymer({
    is: 'group-follow',
    properties: {
        groupId: {
            type: String,
            observer: 'pageLoad'
        },
    },
    ready: function () {
        var test = this.groupId;
        this.pageLoad();
    },
    pageLoad: function () {
        this.fire("status-message-update");
        this.getGroup(this.groupId);
    },

    getGroup: function (groupId) {
        this.ajaxCall = 'getGroup';
        this.makeAjaxCall(null, 'Getting group in progress...');
    },

    followGroupHandler: function (groupId) {
        this.ajaxCall = 'subscribeGroup';
        this.makeAjaxCall(null, 'Subscribing group...');
    },

    makeAjaxCall: function (event = null, initialMessage = null) {
        if (initialMessage) {
            this.fire("status-message-update", {
                severity: 'info',
                message: initialMessage
            });
        } else {
            this.fire("status-message-update");
        }

        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (!loggedInUser) {
            this.fire("status-message-update", {
                severity: 'error',
                message: "Please log-in first."
            });
            return;
        }
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        ajax.contentType = 'application/json';
        ajax.headers['Version'] = '1.0';
        ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
        ajax.body = "";
        switch (this.ajaxCall) {
            case 'getGroup':
                ajax.method = 'GET';
                ajax.url = serviceBaseUrl + '/groups/' + this.groupId + '?fields=name|description|createdBy|administrators';
                break;

            case 'subscribeGroup':
                ajax.url = serviceBaseUrl + '/userdetails/' + loggedInUser.id + '/followingGroups/' + this.groupId;
                ajax.method = 'POST';
                break;
        }
        ajax.generateRequest();
    },

    handleErrorResponse: function (e) {
        this.closeAddEventDialog();
        var errorResponse = e.detail.request.xhr.response;
        message = 'Server threw error. Check if you are logged in.';
        let severity = 'error';
        if (errorResponse !== null) {
            switch (errorResponse.errorcode) {
                case 'GenericHttpRequestException':
                    message = 'Oh! ohh! Looks like there is some internal issue. Please try again after some time.';
                    break;
                case 'UserNotAuthorized':
                    message = 'User is not authorized.';
                    break;
                default:
                    message = errorResponse.errorcode + ' has not been handled yet.';
                    break;
            }
        }

        this.fire("status-message-update", {
            severity: severity,
            message: message
        });
    },

    handleAjaxResponse: function (group) {
        this.fire("status-message-update");
        switch (this.ajaxCall) {
            case 'getGroup':
                this.groupObject = group.detail.response;
                this.groupObject.createdBy = this.groupObject.createdBy ? this.groupObject.createdBy : 'Not Owner';
                this.groupObject.administrators = this.groupObject.administrators ? this.groupObject.administrators : ['Not Admin'];
                this.populateGroupDetails(this.groupObject);
                break;

            case 'subscribeGroup':
                var subscibedGroup = group.detail.response;
                var followinggroups = Polymer.globalsManager.globals.followingGroups;
                if (!followinggroups) {
                    followinggroups = [];
                }

                followinggroups.push(subscibedGroup.id);
                Polymer.globalsManager.set('followingGroups', followinggroups);
                this.fire('page-load-requested', {
                    page: '/events'
                });
                break;
        }
    },

    populateGroupDetails: function (groupObject) {
        this.$.groupName.textContent = groupObject.name;
        this.$.groupDesc.textContent = groupObject.description;
    },
});