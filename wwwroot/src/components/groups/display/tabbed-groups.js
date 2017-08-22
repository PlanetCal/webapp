Polymer({
    is: 'tabbed-groups',

    ready: function () {
        this.selectedTab = 0;
        //var groupTypes = ['owned', 'subscribed', 'administered'];
    },

    createGroup: function (e) {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
        this.fire('on-edit-group');
    },
});