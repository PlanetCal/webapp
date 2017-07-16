Polymer({
    is: 'groups-display',
    properties: {
        groupType: {
            type: String,
            value: '',
        },
    },
    ready: function () {
        this.fire("status-message-update");
        // var nameFieldDiv = this.$.nameFieldDiv;
        var items = [];
        //this.loadGroups();
    },
    loadGroups: function () {
        this.groupType = 'getGroups';
        this.makeAjaxCall();
    },
    makeAjaxCall: function (event = null) {
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        ajax.url = serviceBaseUrl + '/groups/';
        switch (this.groupType) {
            case 'getGroups':
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
        }
        ajax.generateRequest();
    },
    handleAjaxResponse: function (groups) {
        // var jsonResponse = e.detail.response;
        switch (this.eventType) {
            case 'getGroups':
                this.items = groups.detail.response;
        }
    },
    handleErrorResponse: function (e) {

        console.log('Displaying groups got error from ajax!');
        this.fire("status-message-update", { severity: 'error', message: 'Error occurred on get groups ...' });
        var req = e.detail.request;
        var jsonResponse = e.detail.request.xhr.response;
        var message = 'Error:';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText;

        // this.$.msg.style.display = 'block';
        // this.messageText = message;
    },
    handleResponse: function (data) {
        this.items = data.detail.response;
    },
    DisplayLimitedText: function (text, count) {
        if (text.length > count) {
            return text.substring(0, count - 3) + '...';
        }
        else {
            return text;
        }
    },
});