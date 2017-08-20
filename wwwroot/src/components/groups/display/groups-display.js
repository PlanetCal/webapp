Polymer({
    is: 'groups-display',
    properties: {
        groupType: {
            type: String,
            value: '',
        }
    },

    ready: function () {
        this.fire("status-message-update");
        this.loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (!this.loggedInUser) {
            this.fire("status-message-update", { severity: 'error', message: 'Please login to view the groups.' });
            return;
        }
        this.loadGroups();
    },

    loadGroups: function () {
        this.ajaxCall = 'getGroups';
        this.makeAjaxCall();
    },

    makeAjaxCall: function (group = null) {
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        if (this.groupType === 'subscribed') {
            ajax.url = serviceBaseUrl + '/userdetails/' + this.loggedInUser.id + '/followinggroups?fields=name|description|privacy|icon|category|createdBy|members|location|address|contact|webSite|modifiedBy';
        } else if (this.groupType === 'administered') {
            ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy&administeredByMe=true';
        }
        else {
            ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy&filter=createdBy=' + this.loggedInUser.id;
        }

        //Keep below line to switch to normal get groups call
        //ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|createdBy|administrators|members|location|address|contact|webSite|modifiedBy';
        switch (this.ajaxCall) {
            case 'getGroups':
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
                ajax.body = '';
                if (this.loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + this.loggedInUser.token;
                }
                break;
            case 'deleteGroup':
                ajax.method = 'DELETE';
                ajax.url = serviceBaseUrl + '/groups/' + group.id;
                ajax.headers['Version'] = '1.0';
                ajax.body = '';
                if (this.loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + this.loggedInUser.token;
                }
                break;
        }
        ajax.generateRequest();
    },

    handleAjaxResponse: function (groups) {
        switch (this.ajaxCall) {
            case 'getGroups':
                this.items = groups.detail.response;
                break;
            case 'deleteGroup':
                var deletedGroup = groups.detail.response;
                this.items = this.removeGroupAndReturnArray(this.items, deletedGroup);
                break;
        }
    },

    removeGroupAndReturnArray: function (groupArray, groupId) {
        var newArray = [];
        groupArray.forEach(function (element, index, array) {
            if (element.id !== groupId.id) {
                newArray.push(element);
            }
        });
        return newArray;
    },

    handleErrorResponse: function (e) {
        var errorResponse = e.detail.request.xhr.response;
        message = 'Server threw error. Check if you are logged in.';
        if (errorResponse !== null) {
            switch (errorResponse.errorcode) {
                case 'GenericHttpRequestException':
                    message = 'Oh! ohh! Looks like there is some internal issue. Please try again after some time.';
                    break;
                case 'GroupNotExistant':
                    message = 'Group does not exist.';
                    break;
                case 'UserNotAuthorized':
                    message = 'User is not authorized.';
                    break;
                default:
                    message = errorResponse.errorcode + ' has not been handled yet.';
                    break;
            }
        }
        this.fire("status-message-update", { severity: 'error', message: message });
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

        Polymer.globalsManager.set('editedGroup', editedGroup);
        this.fire('on-edit-group');
    },

    createGroup: function (e) {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
        this.fire('on-edit-group');
    },

    deleteGroup: function (e) {
        var group = e.model.item;
        this.ajaxCall = 'deleteGroup'

        // The logic to decide if user can delete the group is more involved than this. For now, let server handle the deletes, and throw error if it can't.
        // if (group.createdBy !== this.loggedInUser.id) {
        //     this.fire("status-message-update", { severity: 'error', message: 'You are not owner to delete the group.' });
        //     return;
        // }

        this.makeAjaxCall(group);
    },

    goToEvents: function (e) {
        var groupDetails = e.model.item;
        Polymer.globalsManager.set('editedGroup', groupDetails);
        this.fire('on-go-to-events');
    },

    populateCardClass: function (item) {
        return item.privacy === 'Closed' ? 'paper-card-private' : '';
    },

    hideForPhone: function (item) {
        return item.contact && item.contact.phone ? '' : 'displayNone';
    },

    hideForEmail: function (item) {
        return item.contact && item.contact.email ? '' : 'displayNone';
    },

    hideForWebsite: function (item) {
        return item.webSite ? '' : 'displayNone';
    },

    hideForEdit: function (item) {
        var isEdit = this.loggedInUser.id === item.createdBy || this.groupType === 'administered';
        return isEdit ? '' : 'displayNone';
    },

    hideForDelete: function (item) {
        var isDelete = this.loggedInUser.id === item.createdBy;
        return isDelete ? '' : 'displayNone';
    },


    groupIcon: function (item) {
        return (!item.icon || item.icon === '') ? '../src/images/noimage.png' : item.icon;
    },

    hideSubscribeButton: function (item) {
        return this.groupType !== 'subscribed' ? 'displayNone' : '';
    },

    groupDisplayName: function (item) {
        var displayName = item.name;
        if (item.privacy === 'Closed') {
            displayName += ' [Closed]';
        }
        return displayName;
    }
});