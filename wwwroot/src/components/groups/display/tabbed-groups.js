Polymer({
    is: 'tabbed-groups',
    groupType: {
        type: String,
        value: ''
    },


    ready: function () {
        this.groupTypes = [
            { id: 'follower', displayName: 'Follower' },
            { id: 'owner', displayName: 'Owner' },
            { id: 'contributor', displayName: 'Contributor' }
        ];
    },

    createGroup: function (e) {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
        this.fire('page-load-requested', { page: '/groups-edit', queryParams: { groupId: '', parentGroup: '', groupTypeToGoTo: this.groupType } });
    },
});