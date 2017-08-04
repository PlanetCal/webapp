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
        isGroupImageChanged: {
            type: Boolean,
            value: false,
            notify: true,
        },
        groupType: {
            type: String,
            value: '',
        },
        groupObject: {
            type: Object,
            value: {},
        },
    },
    ready: function () {
        this.fire("status-message-update");
        var items = [];
        var editedGroup = '';
        if (this.localStorage) {
            editedGroup = this.localStorage.editedGroup;
        } else {
            this.reset();
        }
    },
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
        var inputElement = e.target.inputElement;
        if (inputElement.files && inputElement.files.length > 0) {
            if (this.isValidFileType(inputElement.files[0].type)) {
                var output = inputElement.files[0];
                this.displayContents(output);
                this.isGroupImageChanged = true;
            }
            else {
                inputElement.value = '';
                this.fire("status-message-update", { severity: 'error', message: 'Invalid file type selected. Please select an image to upload.' });
            }
        }
        else if (this.isGroupImageChanged) {
            this.previewSrc = '';
        }
    },
    displayContents: function (output) {
        this.previewSrc = window.URL.createObjectURL(output);
    },
    resizeImageSelection: function (file) {
        var myURL = window.URL || window.webkitURL;
        var img = this.$.previewImage;
        var imageWidth = 300, imageHeight = 140;
        img.width = imageWidth;
        img.height = imageHeight;

        var canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = imageHeight;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        var dataUrl = canvas.toDataURL('image/jpeg');
        return this.dataURLToBlob(dataUrl);
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
    },
    validateGroupImage: function () {
        if (!this.previewSrc || this.previewSrc == '')
            return this.$$('#groupImage').validate();
        else
            return true;
    },
    validateOnChange: function (e) {
        e.target.$.input.validate();
    },
    isValidFileType: function (fileType) {
        if (fileType == 'image/jpg' || 'image/jpeg' || fileType == 'image/bmp' || fileType == 'image/png') {
            return true;
        }
        else {
            return false;
        }
    },
    constructGroupObject: function () {
        var obj = {};
        if (this.id && this.id !== 'null') {
            obj.id = this.id;
        }
        obj.name = this.name;
        obj.description = this.description;
        obj.address = {};
        obj.address.streetNumber = this.streetNumber;
        obj.address.streetName = this.streetName;
        obj.address.city = this.city;
        obj.address.state = this.state;
        obj.address.postalCode = this.postalCode;
        obj.location = this.location;
        obj.contact = {};
        obj.contact.phone = this.phone;
        obj.contact.email = this.email;
        obj.owner = this.owner;
        obj.webSite = this.website;
        obj.administrators = this.administrators;
        obj.members = this.members;
        obj.privacy = this.privacy;
        //obj.icon = this.previewSrc;
        return obj;
    },
    saveGroup: function (e) {
        var isValid = this.validate();
        isValid = isValid && this.validateGroupImage();
        isValid = isValid && this.isGroupImageChanged && this.isValidFileType(this.$.groupImage.inputElement.files[0].type);
        if (isValid) {
            this.fire("status-message-update", { severity: 'info', message: 'Save group in progress....' });
            this.enableORdisableGroup(true);
            this.groupObject = this.constructGroupObject();
            this.groupType = this.groupObject.id ? 'putGroup' : 'postGroup';
            this.makeAjaxCall(this.groupObject);
        }
    },
    enableORdisableGroup: function (value) {
        this.$.savegroup.disabled = value;
        this.$.resetgroup.disabled = value;
        this.$.deletegroup.disabled = value;
    },
    makeAjaxCall: function (group = null) {
        //this.isLoading = true;
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        ajax.url = serviceBaseUrl + '/groups/';
        ajax.contentType = 'application/json';
        switch (this.groupType) {
            case 'postGroup':
                ajax.body = JSON.stringify(group);
                ajax.method = 'POST';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'putGroup':
                ajax.url += group.id;
                ajax.body = JSON.stringify(group);
                ajax.method = 'PUT';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'deletegroup':
                ajax.url += group.id;
                // ajax.body = JSON.stringify(event.id);
                ajax.method = 'DELETE';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'groupImage':
                var data = new FormData();
                var file = this.$$('#groupImage').$.input.files[0];
                var fileName = this.groupObject.id + '.jpg';
                var dataURL = this.resizeImageSelection(file);
                data.append(fileName, dataURL);
                //data.append(fileName, file);
                ajax.url = serviceBaseUrl + '/blob/';
                ajax.body = data;
                ajax.contentType = undefined;
                ajax.method = 'POST';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                ajax.headers['groupid'] = this.groupObject.id;
                this.fire("status-message-update", { severity: 'info', message: 'Image upload in progress....' });
                break;
        }
        ajax.generateRequest();
    },

    handleErrorResponse: function (e) {
        console.log('Save group got error from ajax!');
        this.fire("status-message-update", { severity: 'error', message: 'Error occurred on save groups...' });
        var req = e.detail.request;
        var jsonResponse = e.detail.request.xhr.response;
        var message = 'Error:';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText;
        this.enableORdisableGroup(false);
    },

    handleAjaxResponse: function () {
        switch (this.groupType) {
            case 'postGroup':
                this.groupObject.id = event.detail.response.id;
                this.uploadImage();
                //this.fire("status-message-update", { severity: 'info', message: 'Event saved successfully ...' });
                break;
            case 'putGroup':
                if (this.isGroupImageChanged) {
                    this.uploadImage();
                    this.isGroupImageChanged = false;
                }
                else {
                    this.backToGroups();
                }
                break;
            case 'deleteGroup':
                //TODO: do we need to delete the image?
                this.backToGroups();
                break;
            case 'groupImage':
                this.updateImageURL(event.detail.response.url);
                break;

        }
    },
    uploadImage: function () {
        this.groupType = 'groupImage';
        this.makeAjaxCall();
    },
    updateImageURL: function (imageURL) {
        this.groupType = 'putGroup';
        this.groupObject.icon = imageURL;
        this.fire("status-message-update", { severity: 'info', message: 'Redirecting to Groups page after save....' });
        this.makeAjaxCall(this.groupObject);
    },
    editImage: function () {
        this.$$('#groupImage').$.input.click();
    }
});