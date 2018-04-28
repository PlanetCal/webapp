Polymer({
    is: 'groups-display',
    properties: {
        groupType: {
            type: String,
            value: '',
            observer: '_dataChanged'
        }
    },

    ready: function () {
        this._dataChanged();
    },

    _dataChanged: function () {
        if (this.groupType === '') {
            return;
        }
        if (this.earlierValue === this.groupType) {
            return;
        }
        this.earlierValue = this.groupType;

        this.fire("on-query-param-changed", {
            groupType: this.groupType
        });

        this.fire("status-message-update");
        this.loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (!this.loggedInUser) {
            this.fire("status-message-update", {
                severity: 'error',
                message: 'Please login to view the groups.'
            });
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
        ajax.headers['Version'] = '1.0';
        if (this.loggedInUser) {
            ajax.headers['Authorization'] = 'Bearer ' + this.loggedInUser.token;
        }

        switch (this.ajaxCall) {
            case 'subscribeGroup':
                ajax.url = serviceBaseUrl + '/userdetails/' + this.loggedInUser.id + '/followingGroups/' + group.id;
                ajax.method = 'POST';
                this.fire("status-message-update", {
                    severity: 'info',
                    message: 'Subscribing group...'
                });
                break;
            case 'unsubscribeGroup':
                ajax.url = serviceBaseUrl + '/userdetails/' + this.loggedInUser.id + '/followingGroups/' + group.id;
                ajax.method = 'DELETE';
                this.fire("status-message-update", {
                    severity: 'info',
                    message: 'Unsubscribing group...'
                });
                break;
            case 'getGroups':
                switch (this.groupType) {
                    case ('owner'):
                        ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy|parentGroup|childGroups&filter=createdBy=' + this.loggedInUser.id;
                        break;
                    case ('follower'):
                        ajax.url = serviceBaseUrl + '/userdetails/' + this.loggedInUser.id + '/followinggroups?fields=name|description|privacy|icon|category|createdBy|members|location|address|contact|webSite|modifiedBy|parentGroup|childGroups';
                        break;
                    case ('contributor'):
                        ajax.url = serviceBaseUrl + '/groups?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy|parentGroup|childGroups&administeredByMe=true';
                        break;
                    default:
                        //this.fire("status-message-update", { severity: 'error', message: 'GroupType ' + this.groupType + ' is not supported.' });
                        return;
                }
                ajax.method = 'GET';
                ajax.body = '';
                this.fire("status-message-update", {
                    severity: 'info',
                    message: 'Loading groups...'
                });
                break;
            case 'deleteGroup':
                ajax.method = 'DELETE';
                ajax.url = serviceBaseUrl + '/groups/' + group.id;
                ajax.body = '';
                this.fire("status-message-update", {
                    severity: 'info',
                    message: 'Deleting group...'
                });
                break;
        }

        ajax.generateRequest();
    },

    handleAjaxResponse: function (groups) {
        switch (this.ajaxCall) {
            case 'getGroups':
                this.items = groups.detail.response;
                if (this.groupType === 'follower') {
                    var followingGroupsToCache = [];
                    this.items.forEach(element => followingGroupsToCache.push(element.id));
                    Polymer.globalsManager.set('followingGroups', followingGroupsToCache);
                }
                break;
            case 'unsubscribeGroup':
                if (this.groupType === 'follower') {
                    var unsubscibedGroup = groups.detail.response;
                    this.items = this.removeGroupAndReturnArray(this.items, unsubscibedGroup);
                    var followingGroupsToCache = [];
                    this.items.forEach(element => followingGroupsToCache.push(element.id));
                    Polymer.globalsManager.set('followingGroups', followingGroupsToCache);
                }
                break;
            case 'subscribeGroup':
                var subscibedGroup = groups.detail.response;
                var followinggroups = Polymer.globalsManager.globals.followingGroups;
                if (!followinggroups) {
                    followinggroups = [];
                }

                followinggroups.push(subscibedGroup.id);
                Polymer.globalsManager.set('followingGroups', followinggroups);
                break;
            case 'deleteGroup':
                var deletedGroup = groups.detail.response;
                this.items = this.removeGroupAndReturnArray(this.items, deletedGroup);
                break;
        }
        this.fire("status-message-update");
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
                case 'GroupHasChildGroups':
                    message = 'This group has one or more child groups. First delete its child groups.';
                    break;
                default:
                    message = errorResponse.errorcode + ' has not been handled yet.';
                    break;
            }
        }
        this.fire("status-message-update", {
            severity: 'error',
            message: message
        });
    },

    DisplayLimitedText: function (text, count) {
        if (text.length > count) {
            return text.substring(0, count - 3) + '...';
        } else {
            return text;
        }
    },

    createChildGroup: function (e) {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
        var editedGroup = e.model.item;
        this.fire('page-load-requested', {
            page: '/groups-edit',
            queryParams: {
                groupId: '',
                parentGroup: editedGroup.id,
                category: editedGroup.category,
                privacy: editedGroup.privacy,
                groupTypeToGoTo: this.groupType
            }
        });
    },

    editGroup: function (e) {
        var editedGroup = e.model.item;
        Polymer.globalsManager.set('editedGroup', editedGroup);
        this.fire('page-load-requested', {
            page: '/groups-edit',
            queryParams: {
                groupId: editedGroup.id,
                parentGroup: '',
                groupTypeToGoTo: this.groupType
            }
        });
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

    unsubscribe: function (e) {
        var groupDetails = e.model.item;
        this.ajaxCall = 'unsubscribeGroup'
        this.makeAjaxCall(groupDetails);
    },

    subscribe: function (e) {
        var groupDetails = e.model.item;
        this.ajaxCall = 'subscribeGroup'
        this.makeAjaxCall(groupDetails);
    },

    goToEvents: function (e) {
        var groupDetails = e.model.item;
        Polymer.globalsManager.set('editedGroup', groupDetails);
        this.fire('page-load-requested', {
            page: '/group-events',
            queryParams: {
                groupId: groupDetails.id
            }
        });
    },

    populateCardClass: function (item) {
        return item.privacy === 'Private' ? 'paper-card-private' : '';
    },

    hideForPhone: function (item) {
        return item.contact && item.contact.phone ? '' : 'displayNone';
    },

    hideForChildGroups: function (item) {
        return item.childGroups && item.childGroups.length > 0 ? '' : 'displayNone';
    },
    hideForParentGroup: function (item) {
        return item.parentGroup ? '' : 'displayNone';
    },

    hideForEmail: function (item) {
        return item.contact && item.contact.email ? '' : 'displayNone';
    },

    hideForWebsite: function (item) {
        return item.webSite ? '' : 'displayNone';
    },

    hideAddChildGroup: function (item) {
        if (!Polymer.globalsManager.globals.enableChildGroups) {
            return 'displayNone';
        }

        var showAdd = this.loggedInUser.id === item.createdBy || this.groupType === 'contributor';
        showAdd = showAdd && (!item.parentGroup);
        return showAdd ? '' : 'displayNone';
    },

    hideForEdit: function (item) {
        var isEdit = this.loggedInUser.id === item.createdBy || this.groupType === 'contributor';
        return isEdit ? '' : 'displayNone';
    },

    // hideForDelete: function (item) {
    //     var isDelete = this.loggedInUser.id === item.createdBy ||
    //         (item.administrators && item.administrators.indexOf(this.loggedInUser.email.toLowerCase()) >= 0);

    //     return isDelete ? '' : 'displayNone';
    // },

    groupIcon: function (item) {
        return (!item.icon || item.icon === '') ? '../src/images/noimage.png' : item.icon;
    },

    hideUnsubscribeButton: function (item) {
        return this.groupType !== 'follower' ? 'displayNone' : '';
    },

    hideSubscribeButton: function (item) {
        if (this.groupType !== 'follower') {
            var followinggroups = Polymer.globalsManager.globals.followingGroups;
            var toReturn = '';
            if (followinggroups && followinggroups.indexOf(item.id) >= 0) {
                toReturn = 'displayNone';
            }
            return toReturn;
        }
        return 'displayNone';
    },

    groupDisplayName: function (item) {
        var displayName = item.name;
        if (item.privacy === 'Private') {
            displayName += ' (Private)';
        }
        return displayName;
    }
});