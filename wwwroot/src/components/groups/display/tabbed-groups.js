Polymer({
    is: 'tabbed-groups',
    groupType: {
        type: String,
        value: ''
    },


    ready: function () {
        this.groupTypes = [
            { id: 'owned', displayName: 'Owned' },
            { id: 'subscribed', displayName: 'Subscribed' },
            { id: 'administered', displayName: 'Administered' }
        ];
    },

    createGroup: function (e) {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
        this.fire('page-load-requested', { page: '/groups-edit', queryParams: { groupId: '', parentGroup: '', groupTypeToGoTo: this.groupType } });
    },

    importEvents: function (e) {
        this.fire('page-load-requested', { page: '/events-import', queryParams: { groupId: '', groupTypeToGoTo: this.groupType } });
    },

});