Polymer({
    is: 'groups-display',
    properties: {
        groupType: {
            type: String,
            value: '',
        },
        ajaxType: {
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
        this.ajaxType = 'getGroups';
        this.makeAjaxCall();
    },
    makeAjaxCall: function (group = null) {
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (this.groupType === 'subscribed') {
            ajax.url = serviceBaseUrl + '/userdetails/' + loggedInUser.id + '/followinggroups?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy';
        }
        else {
            ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy&filter=createdBy=' + loggedInUser.id;
        }

        //Keep below line to switch to normal get groups call
        //ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|createdBy|administrators|members|location|address|contact|webSite|modifiedBy';
        switch (this.ajaxType) {
            case 'getGroups':
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'deleteGroup':
                ajax.method = 'DELETE';
                ajax.url = serviceBaseUrl + '/groups/' + group.id;
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
        }
        ajax.generateRequest();
    },
    handleAjaxResponse: function (groups) {
        // var jsonResponse = e.detail.response;
        switch (this.ajaxType) {
            case 'getGroups':
                var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
                var tempItems = groups.detail.response;
                tempItems.forEach(function (item, index) {
                    // To identify which groups the current user can edit
                    if (item.createdBy && item.createdBy.toLowerCase() === loggedInUser.id.toLowerCase()) {
                        item.isEdit = true;
                    }
                    else {
                        item.isEdit = false;
                    }
                    // To identify which groups are private
                    if (item.privacy.toLowerCase() === 'closed') {
                        item.isPrivate = true;
                        item.isEdit = false;
                        item.name += ' [Closed Group]';
                    }
                    if (!item.icon || item.icon === '') {
                        item.icon = '../src/images/noimage.png';
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
            case 'deleteGroup':
                this.fire("status-message-update", { severity: 'info', message: 'Successfully deleted the group' });
                this.ajaxType = 'getGroups';
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
            if (item.createdBy.toLowerCase() === loggedInUser.id.toLowerCase()) {
                item.isEdit = true;
            }
            else {
                item.isEdit = false;
            }
            // To identify which groups are private
            if (item.privacy.toLowerCase() === 'private') {
                item.isPrivate = true;
                item.name += '[Private]';
            }
            else {
                item.isPrivate = false;
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

        this.set('localStorage.editedGroup', editedGroup);
        Polymer.globalsManager.set('editedGroup', editedGroup);
        this.fire('on-edit-group');
        //window.location.href = 'groups-edit';
    },
    createGroup: function (e) {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
        //window.location.href = 'groups-edit';
        this.fire('on-edit-group');
    },
    deleteGroup: function (e) {
        var group = e.model.item;
        this.ajaxType = 'deleteGroup'
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (group.createdBy.toLowerCase() !== loggedInUser.id.toLowerCase()) {
            this.fire("status-message-update", { severity: 'error', message: 'You are not owner to delete the group.' });
            return;
        }
        //TODO: Add code changes to delete
        this.makeAjaxCall(group);
    },
    populateCardClass: function (isPrivate) {
        if (isPrivate)
            return 'paper-card-private';
        this.updateStyles();
    },
    hideForPrivate: function (isPrivate) {
        if (isPrivate)
            return 'displayNone';
        this.updateStyles();
    },
    hideForEdit: function (isEdit) {
        if (!isEdit)
            return 'displayNone';
        this.updateStyles();
    }
});