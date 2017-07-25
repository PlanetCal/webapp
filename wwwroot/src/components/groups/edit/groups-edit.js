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
        },
        isImageChanged: {
            type: Boolean,
            value: false,
            notify: true,
        },
    },
    ready: function () {
        this.fire("status-message-update");
        var nameFieldDiv = this.$.nameFieldDiv;
        var items = [];
        var editedGroup = '';
        if (this.localStorage) {
            editedGroup = this.localStorage.editedGroup;
        } else {
            this.reset();
        }
        var groupDetails = Polymer.globalsManager.globals.groupDetails;
        var dd = groupDetails;
    },

    // validateOnChange: function () {
    //     var editedGroup = '';
    //     if (this.localStorage) {
    //         editedGroup = this.localStorage.editedGroup;
    //     }
    //     var groupDetails = Polymer.globalsManager.globals.groupDetails;
    // },

    _onLocalStorageLoad: function () {
        var editedGroup = '';
        if (this.localStorage && this.localStorage.editedGroup) {
            editedGroup = this.localStorage.editedGroup;
            this.populateEditedGroup(editedGroup);
        }
        else {
            this.reset();
        }
    },
    previewImage: function (e) {
        var output = e.target.inputElement.files[0];
        //document.getElementById('PreviewImage').src = window.URL.createObjectURL(file);
        this.displayContents(output);
    },
    displayContents: function (output) {
        //this.$.PreviewImage.src = window.URL.createObjectURL(output);
        this.previewSrc = window.URL.createObjectURL(output);
    },
    resizeImageSelection: function (e) {
        var file = e.target.inputElement.files[0];
        var img = document.createElement("img");
        img.src = window.URL.createObjectURL(file);

        var canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 400;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        var dataUrl = canvas.toDataURL('image/jpeg');
        return dataUrl;
        //var resizedImage = this.dataURLToBlob(dataUrl);
        //this.$.previewImage.src = dataUrl;
        //this.previewImage(e);
    },
    dataURLToBlob: function (dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];

            return new Blob([raw], { type: contentType });
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    },


    populateEditedGroup: function (editedGroup) {
        //TODO: Popualte all values from local storage to corresponding fields.
        this.id = editedGroup.id;
        this.name = editedGroup.name;
        this.description = editedGroup.description;
        this.streetNumber = editedGroup.address.streetNumber;
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
        this.previewSrc = editedGroup.icon;
    },

    reset: function () {
        var tempOwner = '';
        if (Polymer.globalsManager.globals.loggedInUser != null && Polymer.globalsManager.globals.loggedInUser != '') {
            tempOwner = Polymer.globalsManager.globals.loggedInUser.email;
        }
        this.id = '';
        this.name = '';
        this.description = '';
        this.streetNumber = '';
        this.streetName = '';
        this.city = '';
        this.state = '';
        this.postalCode = '';
        this.location = '';
        this.phone = '';
        this.email = '';
        this.owner = tempOwner;
        this.website = '';
        this.administrators = [];
        this.members = [];
        this.privacy = 'Open';
        this.previewSrc = '';
        this.resetLocalStorageForEditedGroup();
    },
    resetLocalStorageForEditedGroup: function () {
        if (this.localStorage) {
            this.set('localStorage.editedGroup', null);
        }
    },
    backToGroups: function () {
        this.resetLocalStorageForEditedGroup();
        //this.fire('on-back-to-groups', { page: '/groups-display' });
        window.location.href = 'groups-display';
    },
    validate: function () {
        var elements = document.getElementsByClassName('saveGroups');
        if (elements && elements.length <= 0) {
            elements = this.shadowRoot.querySelectorAll('.saveGroups')
        }
        var isValid = true;
        for (var i = 0; i < elements.length; i++) {
            var tempIsValid = elements[i].validate();
            if (!tempIsValid) {
                isValid = tempIsValid
            }
        }
        return isValid;
        //document.getElementsByClassName('.addEvent').validate();
    },
    validateOnChange: function (e) {
        e.target.validate();
    },
    saveGroup: function (e) {
        var isValid = this.validate();
        if (isValid) {
            this.$.savegroup.disabled = true;
            //this.$.cancelevent.disabled = true;
            //this.eventObject = this.constructEventObject();
            //this.eventType = this.eventObject.id ? 'putEvents' : 'postEvents';
            //this.makeAjaxCall(this.eventObject);
        }
    },
});