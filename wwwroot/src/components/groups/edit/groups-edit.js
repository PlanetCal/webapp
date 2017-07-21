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
        this.name = editedGroup.Name;
        this.description = editedGroup.Discription;
        this.streetNumber = editedGroup.Address.StreetNumber;
        this.streetName = editedGroup.Address.StreetName;
        this.city = editedGroup.Address.City;
        this.state = editedGroup.Address.State;
        this.postalCode = editedGroup.Address.PostalCode;
        this.location = editedGroup.Location;
        this.phone = editedGroup.Contact.Phone;
        this.email = editedGroup.Contact.Email;
        this.owner = editedGroup.Owner;
        this.website = editedGroup.WebSite;
        this.administrators = editedGroup.Administrators;
        this.members = editedGroup.Members;
        this.privacy = editedGroup.Privacy;
    },
});