Polymer({
    is: 'groups-edit',
    properties: {
        page: {
            type: Number,
            notify: true,
            value: 0,
            // observer: '_handlePageChanged',
        },
        isSaveValid: {
            type: Boolean,
            value: false,
            notify: true,
        }
    },
    ready: function () {
        this.fire("status-message-update");
        var nameFieldDiv = this.$.nameFieldDiv;
        var items = [];
        var editedGroup = '';
        if (this.localStorage) {
            editedGroup = this.localStorage.editedGroup;
        }
        var groupDetails = Polymer.globalsManager.globals.groupDetails;
        var dd = groupDetails;
    },

    validateOnChange: function () {
        var editedGroup = '';
        if (this.localStorage) {
            editedGroup = this.localStorage.editedGroup;
        }
        var groupDetails = Polymer.globalsManager.globals.groupDetails;
    },

    _onLocalStorageLoad: function () {
        var editedGroup = '';
        if (this.localStorage) {
            editedGroup = this.localStorage.editedGroup;
            this.populateEditedGroup(editedGroup);
        }
    },
    populateEditedGroup: function (editedGroup) {
        //TODO: Popualte all values from local storage to corresponding fields.
        this.id = editedGroup.id;
        this.name = editedGroup.name;
        this.description = editedGroup.description;
        this.streetNumber = editedGroup.address.atreetNumber;
        this.streetName = editedGroup.address.streetName;
        this.city = editedGroup.address.city;
        this.state = editedGroup.address.state;
        this.postalCode = editedGroup.address.postalCode;
        this.location = editedGroup.location;
        this.phone = editedGroup.contact.phone;
        this.email = editedGroup.contact.email;
        this.owner = editedGroup.owner;
        this.website = editedGroup.webSite;
        this.administrators = editedGroup.administrators;
        this.members = editedGroup.members;
        this.privacy = editedGroup.privacy;
    },
});