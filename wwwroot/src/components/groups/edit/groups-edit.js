Polymer({
    is: 'groups-edit',
    behaviors: [
        Polymer.IronResizableBehavior,
    ],
    properties: {
        groupTypeToGoBack: {
            type: String,
            observer: '_dataChanged',
        },
        groupId: {
            type: String,
            observer: '_dataChanged',
        }
    },
    listeners: {
        'iron-resize': 'onGroupsEditResize',
    },
    ready: function () {
        this.isGroupImageChanged = false;
        this.groupObject = {};
        this._dataChanged();
    },

    _dataChanged: function () {
        if (this.groupId && this.groupTypeToGoBack) {
            this.regionExpanded = false;
            this.updateExpandButtonTextAndIcon(this.regionExpanded);
            this.pageLoad();
        }
    },

    pageLoad: function () {
        this.fire("status-message-update");
        var items = [];

        if (this.groupId === 'null') {
            this.reset();
        }
        else {
            var editedGroup = Polymer.globalsManager.globals.editedGroup;
            if (editedGroup && editedGroup.id === this.groupId) {
                this.populateEditedGroup(editedGroup);
            } else {
                //we need to laod the group from the backend.
                this.getGroup(this.groupId);
            }
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
        this.id = editedGroup.id;
        this.name = editedGroup.name;
        this.description = editedGroup.description;
        this.address = editedGroup.address;
        this.location = editedGroup.location;
        if (!editedGroup.contact) {
            editedGroup.contact = {};
        }
        this.phone = editedGroup.contact.phone;
        this.email = editedGroup.contact.email;
        this.website = editedGroup.webSite;
        this.administrators = editedGroup.administrators ? editedGroup.administrators.join(';') : '';
        //this.members = editedGroup.members;
        this.privacy = editedGroup.privacy;
        this.previewSrc = editedGroup.icon;
        this.category = editedGroup.category;
    },

    reset: function () {
        this.id = '';
        this.name = '';
        this.description = '';
        this.address = '';
        this.location = '';
        this.phone = '';
        this.email = '';
        this.website = '';
        this.administrators = '';
        //this.members = [];
        this.privacy = 'Closed';
        this.previewSrc = '';
        this.category = 'Personal';
        this.resetGlobalManagerForEditedGroup();
    },

    updateExpandButtonTextAndIcon: function (expanded) {
        if (!expanded) {
            this.expandButtonText = 'Show advanced (optional) fields';
            this.expandButtonIcon = 'icons:expand-more';
        } else {
            this.expandButtonText = 'Hide advanced (optional) fields';
            this.expandButtonIcon = 'icons:expand-less';
        }
    },

    toggle: function () {
        this.$.collapse.toggle();
        this.regionExpanded = !this.regionExpanded;
        this.updateExpandButtonTextAndIcon(this.regionExpanded);
    },

    resetGlobalManagerForEditedGroup: function () {
        if (Polymer.globalsManager.editedGroup) {
            Polymer.globalsManager.set('editedGroup', null);
        }
    },
    backToGroups: function () {
        this.resetGlobalManagerForEditedGroup();
        this.fire("status-message-update");
        this.fire('page-load-requested', { page: 'my-groups', queryParams: { groupType: this.groupTypeToGoBack } });
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
        if (fileType == 'image/jpg' || fileType == 'image/jpeg' || fileType == 'image/bmp' || fileType == 'image/png') {
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
        obj.address = this.address;
        obj.location = this.location;
        obj.contact = {};
        obj.contact.phone = this.phone;
        obj.contact.email = this.email;
        obj.webSite = this.website;
        obj.administrators = this.administrators;
        obj.members = this.members;
        obj.privacy = this.privacy;
        obj.category = this.category;
        if (!this.isGroupImageChanged)
            obj.icon = this.previewSrc;
        return obj;
    },

    getGroup: function (groupId) {
        this.ajaxCall = 'getGroup';
        this.fire("status-message-update", { severity: 'info', message: 'Getting group in progress...' });
        this.groupObject = { id: groupId };
        this.makeAjaxCall(this.groupObject);
    },

    delete: function (e) {
        this.groupObject = this.constructGroupObject();
        this.ajaxCall = 'deleteGroup';
        this.fire("status-message-update", { severity: 'info', message: 'Delete group in progress...' });
        this.makeAjaxCall(this.groupObject);
    },
    saveGroup: function (e) {
        var isValid = this.validate();
        //isValid = isValid && this.validateGroupImage();
        if (isValid && this.isGroupImageChanged) {
            isValid = this.isValidFileType(this.$.groupImage.inputElement.files[0].type);
        }
        if (isValid) {
            this.fire("status-message-update", { severity: 'info', message: 'Save group in progress...' });
            this.groupObject = this.constructGroupObject();
            this.ajaxCall = this.groupObject.id ? 'putGroup' : 'postGroup';
            this.makeAjaxCall(this.groupObject);
        }
    },

    makeAjaxCall: function (group) {
        //this.isLoading = true;
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        ajax.url = serviceBaseUrl + '/groups/';
        ajax.contentType = 'application/json';
        if (group && group.administrators) {
            if (!Array.isArray(group.administrators)) {
                group.administrators = group.administrators.toLowerCase().split(/,| |;/);
            }
            for (var i = 0; i < group.administrators.length; i++) {
                if (group.administrators[i].length > 0 && !this.isEmailValid(group.administrators[i])) {
                    this.fire("status-message-update", { severity: 'error', message: group.administrators[i] + ' is not a valid administrator email.' });
                    return;
                }
            }
        }

        switch (this.ajaxCall) {
            case 'getGroup':
                ajax.url += group.id + '?fields=name|description|privacy|icon|category|createdBy|administrators|members|location|address|contact|webSite|modifiedBy';
                ajax.body = '';
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'postGroup':
                ajax.body = JSON.stringify(group);
                ajax.method = 'POST';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                this.fire("status-message-update", { severity: 'info', message: 'new group creation in progress...' });
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
            case 'deleteGroup':
                ajax.url += group.id;
                ajax.body = '';
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
                this.fire("status-message-update", { severity: 'info', message: 'Image upload in progress...' });
                break;
        }
        ajax.generateRequest();
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
                case 'InvalidEmail':
                    message = 'Administrator email is invalid.';
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

    isEmailValid: function (email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    },

    handleAjaxResponse: function () {
        switch (this.ajaxCall) {
            case 'getGroup':
                this.groupObject = event.detail.response;
                this.populateEditedGroup(this.groupObject);
                this.fire("status-message-update");
                break;
            case 'postGroup':
                this.groupObject.id = event.detail.response.id;
                if (this.isGroupImageChanged) {
                    this.uploadImage();
                    this.isGroupImageChanged = false;
                }
                else {
                    this.backToGroups();
                }
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
        this.ajaxCall = 'groupImage';
        this.makeAjaxCall();
    },
    updateImageURL: function (imageURL) {
        this.ajaxCall = 'putGroup';
        this.groupObject.icon = imageURL;
        this.fire("status-message-update", { severity: 'info', message: 'Redirecting to Groups page after save...' });
        this.makeAjaxCall(this.groupObject);
    },
    editImage: function () {
        var test = this.$.groupImage.$.input.click();
    },
    onGroupsEditResize: function () {
        //This function will be called when the window is resized.
        var width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        var instructions = this.$$('#imageUploadInstructions');

        if (this.timeout) { return }
        this.timeout = setTimeout(() => {
            if (width < 800) {
                if (instructions) {
                    instructions.style.display = 'none';
                }
            }
            else {
                if (instructions) {
                    instructions.style.display = '';
                }
            }
            clearTimeout(this.timeout)
            this.timeout = null
        }, 2000)
    },
});