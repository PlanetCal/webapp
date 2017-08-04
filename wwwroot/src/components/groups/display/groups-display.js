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
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (typeof loggedInUser === 'undefined') {
            this.fire("status-message-update", { severity: 'error', message: 'Please login to view the groups.' });
            return;
        }
        // var nameFieldDiv = this.$.nameFieldDiv;
        var items = [];
        this.loadGroups();
    },
    loadGroups: function () {
        this.groupType = 'getGroups';
        this.makeAjaxCall();
    },
    makeAjaxCall: function (event = null) {
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        //ajax.url = serviceBaseUrl + '/userdetails/' + loggedInUser.id + '/followinggroups?fields=name|description|privacy|icon|owner|administrators|members|location|address|contact|webSite';
        //Keep below line to switch to normal get groups call
        ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|owner|administrators|members|location|address|contact|webSite';
        switch (this.groupType) {
            case 'getGroups':
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
        }
        ajax.generateRequest();
    },
    handleAjaxResponse: function (groups) {
        // var jsonResponse = e.detail.response;
        switch (this.groupType) {
            case 'getGroups':
                var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
                var tempItems = groups.detail.response;
                tempItems.forEach(function (item, index) {
                    // To identify which groups the current user can edit
                    if (item.owner.toLowerCase() === loggedInUser.id.toLowerCase()) {
                        item.isEdit = true;
                    }
                    else {
                        item.isEdit = false;
                    }
                    if (!item.icon) {
                        item.icon = '';
                    }
                    if (!item.administrators) {
                        item.administrators = [];
                    }
                    if (!item.members) {
                        item.members = [];
                    }
                    if (!item.location) {
                        item.location = '';
                    }
                    if (!item.address) {
                        item.address = [];
                        item.address.streetNumber = '';
                        item.address.streetName = '';
                        item.address.city = '';
                        item.address.state = '';
                        item.address.postalCode = '';
                    }
                    if (!item.contact) {
                        item.contact = [];
                        item.contact.phone = '';
                        item.contact.email = '';
                    }
                    if (!item.webSite) {
                        item.webSite = '';
                    }
                });
                this.items = tempItems;
                break;
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
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        var tempItems = data.detail.response;
        tempItems.forEach(function (item, index) {
            // To identify which groups the current user can edit
            if (item.owner.toLowerCase() === loggedInUser.id.toLowerCase()) {
                item.isEdit = true;
            }
            else {
                item.isEdit = false;
            }
            if (!item.icon) {
                item.icon = '';
            }
            if (!item.administrators) {
                item.administrators = [];
            }
            if (!item.members) {
                item.members = [];
            }
            if (!item.location) {
                item.location = '';
            }
            if (!item.address) {
                item.address = [];
                item.address.streetNumber = '';
                item.address.streetName = '';
                item.address.city = '';
                item.address.state = '';
                item.address.postalCode = '';
            }
            if (!item.contact) {
                item.contact = [];
                item.contact.phone = '';
                item.contact.email = '';
            }
            if (!item.webSite) {
                item.webSite = '';
            }
        });
        this.items = tempItems;
    },
    DisplayLimitedText: function (text, count) {
        if (text.length > count) {
            return text.substring(0, count - 3) + '...';
        }
        else {
            return text;
        }
    },
    editGroup: function (e) {
        var editedGroup = e.model.item;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (editedGroup.name.toLowerCase() === 'default') {
            this.fire("status-message-update", { severity: 'error', message: 'You are not allowed to edit the default group.' });
            return;
        }
        //check whether the current user has edit permission
        // if (!editedGroup.isEdit) {
        //     this.fire("status-message-update", { severity: 'error', message: 'You are not owner to edit the group.' });
        //     return;
        // }

        this.set('localStorage.editedGroup', editedGroup);
        //this.fire('on-edit-group');
        window.location.href = 'groups-edit';
    },
    createGroup: function (e) {
        if (this.localStorage) {
            this.set('localStorage.editedGroup', null);
        }
        window.location.href = 'groups-edit';
    },
    deleteGroup: function (e) {
        var group = e.model.item;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (group.owner.toLowerCase() !== loggedInUser.email.toLowerCase()) {
            this.fire("status-message-update", { severity: 'error', message: 'You are not owner to delete the group.' });
            return;
        }
        //TODO: Add code changes to delete
    }
});