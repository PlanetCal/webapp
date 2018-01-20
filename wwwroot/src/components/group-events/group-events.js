Polymer({
    is: 'group-events',
    properties: {
        groupId: {
            type: String,
            observer: 'pageLoad'
        },
    },
    ready: function () {
        this.expanded = false;
        this.updateExpandButtonTextAndIcon(this.expanded);
        this.pageLoad();
    },
    pageLoad: function () {
        this.fire("status-message-update");
        var nameFieldDiv = this.$.nameFieldDiv;
        var editedGroup = Polymer.globalsManager.globals.editedGroup;
        if (!editedGroup) {
            this.getGroup(this.groupId);
        }
        else {
            this.populateGroupDetails(editedGroup);
        }
    },
    populateGroupDetails: function (editedGroup) {
        this.$.groupName.textContent = editedGroup.name;
        this.$.groupDesc.textContent = editedGroup.description;
        this.loadEvents();
        this.isAddEventsAllowed(editedGroup);
    },
    isAddEventsAllowed: function (groupDetail) {
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        this.isCurrentUserGroupOwnerOrAdmin = this.isUserGroupOwnerOrAdmin(loggedInUser, groupDetail);
        if (groupDetail && loggedInUser && this.isCurrentUserGroupOwnerOrAdmin) {
            this.$.btnAddEvent.style.display = '';
            this.$.btnImportEvent.style.display = '';
        }
        else {
            this.$.btnAddEvent.style.display = 'none';
            this.$.btnImportEvent.style.display = 'none';
        }
    },
    isUserGroupOwnerOrAdmin: function (loggedInUser, groupDetail) {
        var result = (loggedInUser && groupDetail && groupDetail.createdBy
            && (loggedInUser.id == groupDetail.createdBy ||
                (groupDetail.administrators && groupDetail.administrators.indexOf(loggedInUser.email.toLowerCase()) >= 0)));
        return result;
    },

    hideEditDeleteButton: function (event) {
        return this.isCurrentUserGroupOwnerOrAdmin ? 'showEditDeleteButton' : 'displayNone';
    },
    getGroup: function (groupId) {
        this.ajaxCall = 'getGroup';
        this.fire("status-message-update", { severity: 'info', message: 'Getting group in progress...' });
        this.makeAjaxCall();
    },
    validate: function () {
        var elements = document.getElementsByClassName('addEvent');
        var isValid = true;
        for (var i = 0; i < elements.length; i++) {
            var tempIsValid = elements[i].validate();
            if (!tempIsValid) {
                isValid = tempIsValid
            }
        }
        return isValid;
    },
    validateOnChange: function (e) {
        e.target.validate();
    },
    pastEvents: function (e) {
        this.fire("status-message-update", { severity: 'info', message: 'Loading past events...' });
        this.ajaxCall = 'getPastEvents';
        this.$.grid.style.display = 'none';
        this.$.btnPast.disabled = true;
        this.$.btnUpcoming.disabled = false;
        this.makeAjaxCall();
    },
    loadEvents: function () {
        this.fire("status-message-update", { severity: 'info', message: 'Loading events...' });
        this.ajaxCall = 'getEvents';
        this.$.grid.style.display = 'none';
        this.$.btnPast.disabled = false;
        this.$.btnUpcoming.disabled = true;
        this.makeAjaxCall();
    },
    showDialog: function (event) {
        this.$.eventDialogHeader.textContent = "Add Event";
        //this.$.saveevent.textContent = "Save";
        this.$.saveevent.disabled = false;
        this.$.cancelevent.disabled = false;
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.addEventDialog);
        this.$.addEventDialog.open();
        var elements = document.getElementsByClassName('addEvent');
        for (var i = 0; i < elements.length; i++) {
            elements[i].invalid = false;
        }
        elements[0].invalid = false;
    },

    importEventsDialog: function (e) {
        //        this.fire('page-load-requested', { page: '/events-import', queryParams: { groupId: '', groupTypeToGoTo: this.groupType } });
        this.$.importEventsDialogHeader.textContent = "Import Events";
        this.$.saveevent.disabled = false;
        this.$.cancelevent.disabled = false;
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.importEventsDialog);
        this.$.importEventsDialog.open();
        // var elements = document.getElementsByClassName('importEvents');
        // for (var i = 0; i < elements.length; i++) {
        //     elements[i].invalid = false;
        // }
        // elements[0].invalid = false;
    },

    addEventToGrid: function () {
        this.eventObject = this.constructEventObject();
        if (this.eventObject.id) { // Update Event
            var index = this.items.findIndex(e => e.id === this.eventObject.id);
            this.items[index] = this.eventObject;
        } else {
            this.items.push(this.eventObject);
        }
        this.populateGrid();
        this.closeAddEventDialog();
    },

    closeAddEventDialog() {
        var dialog = this.$.addEventDialog;
        if (dialog) {
            dialog.close();
        }
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

    onStartDateChange: function (e) {
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.startDatePickerDialog);
        this.$.startDatePickerDialog.open();
        this.tempStartDateTime = this.startDateTime;
    },
    setStartDate: function () {
        this.startDate = this.formatDate(this.startDateTime);
    },
    onStartTimeChange: function (e) {
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.startTimePickerDialog);
        this.$.startTimePickerDialog.open();
    },
    setStartTime: function () {
        if (Object.prototype.toString.call(this.startDateTime) === '[object Date]') {
            this.startDateTime.setHours(this.getHoursIn24HourFormat(this.startTime));
            this.startDateTime.setMinutes(this.getMinutes(this.startTime));
        }
        else {
            var tempDate = new Date(this.startDateTime);
            tempDate.setHours(this.getHoursIn24HourFormat(this.startTime));
            tempDate.setMinutes(this.getMinutes(this.startTime));
            this.startDateTime = tempDate;
        }
    },
    onEndDateChange: function (e) {
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.endDatePickerDialog);
        this.$.endDatePickerDialog.open();
        this.tempEndDateTime = this.endDateTime;
    },
    setEndDate: function () {
        this.endDate = this.formatDate(this.endDateTime);
    },
    onEndTimeChange: function (e) {
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.endTimePickerDialog);
        this.$.endTimePickerDialog.open();
    },
    setEndTime: function () {
        if (Object.prototype.toString.call(this.endDateTime) === '[object Date]') {
            this.endDateTime.setHours(this.getHoursIn24HourFormat(this.endTime));
            this.endDateTime.setMinutes(this.getMinutes(this.endTime));
        }
        else {
            var tempDate = new Date(this.endDateTime);
            tempDate.setHours(this.getHoursIn24HourFormat(this.endTime));
            tempDate.setMinutes(this.getMinutes(this.endTime));
            this.endDateTime = tempDate;
        }
    },
    cancelStartDate: function () {
        this.startDateTime = this.tempStartDateTime;
    },
    cancelEndDate: function () {
        this.endDateTime = this.tempEndDateTime;
    },
    cancelStartTime: function () {
        this.startTime = this.formatTime(this.endDateTime);
    },
    cancelEndTime: function () {
        this.endTime = this.formatTime(this.endDateTime);
    },
    saveEvent: function (e) {
        var isValid = this.validate();
        if (isValid) {
            this.$.saveevent.disabled = true;
            this.$.cancelevent.disabled = true;
            this.eventObject = this.constructEventObject();
            this.ajaxCall = this.eventObject.id ? 'putEvents' : 'postEvents';
            this.makeAjaxCall(this.eventObject);
        }
    },

    executeImportEvents: function (e) {
        var isValid = this.validate();
        if (isValid) {
            this.$.saveevent.disabled = true;
            this.$.cancelevent.disabled = true;
            this.events = this.constructEventsObjectToImport();
            this.ajaxCall = 'importEvents'
            this.makeAjaxCall(this.eventObject);
        }
    },

    cancelEvent: function (e) {
        this.emptyEventFields();
    },

    cancelImportEvents: function () {
        var dialog = this.$.importEventsDialog;
        if (dialog) {
            dialog.close();
        }
    },


    deleteEvent: function (e) {
        e.preventDefault();
        this.ajaxCall = 'deleteEvents';
        this.eventObject = e.model.item;
        this.makeAjaxCall(e.model.item);
    },
    editEvent: function (e) {
        e.preventDefault();
        if (!Polymer.globalsManager.globals.loggedInUser) {
            this.fire("status-message-update", { severity: 'error', message: "Please log-in first." });
            return;
        }

        var editedItem = e.model.item;
        this.showDialog();
        this.id = editedItem.id;
        this.name = editedItem.name;
        this.description = editedItem.description;
        this.startDateTime = new Date(editedItem.startDateTime);
        this.startDate = this.formatDate(editedItem.startDateTime);
        this.startTime = this.formatTime(editedItem.startDateTime);
        this.endDateTime = new Date(editedItem.endDateTime);
        this.endDate = this.formatDate(editedItem.endDateTime);
        this.endTime = this.formatTime(editedItem.endDateTime);
        this.address = editedItem.address;
        this.location = editedItem.location;
        this.groupId = editedItem.groupId;
        //this.icon = editedItem.icon;
        this.previewSrc = editedItem.icon;
        this.$.eventDialogHeader.textContent = "Update Event";
        //this.$.saveevent.textContent = "Save";
    },
    emptyEventFields: function () {
        this.id = null;
        this.name = null;
        this.description = null;
        this.startDateTime = new Date();
        this.startDate = this.formatDate(new Date());
        this.startTime = this.formatTime(new Date());
        this.endDateTime = new Date();
        this.endDate = this.formatDate(new Date());
        this.endTime = this.formatTime(new Date());
        this.address = null;
        this.location = null;
        this.icon = null;
        this.previewSrc = '';
        this.eventObject = {};
        this.closeAddEventDialog();
    },
    constructEventObject: function () {
        var obj = {};
        if (this.id && this.id !== 'null') {
            obj.id = this.id;
        }
        obj.name = this.name;
        obj.description = this.description;
        obj.startDateTime = this.startDateTime;
        obj.endDateTime = this.endDateTime;
        obj.address = this.address;
        obj.location = this.location;
        obj.groupId = this.groupId;
        if (!this.isEventsImageChanged)
            obj.icon = this.previewSrc;
        return obj;
    },
    makeAjaxCall: function (event = null) {
        //this.isLoading = true;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        if (!loggedInUser) {
            this.fire("status-message-update", { severity: 'error', message: "Please log-in first." });
            return;
        }
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var currentDate = moment().format("YYYY-MM-DD");
        var pastDate = moment().subtract(90, 'day').format("YYYY-MM-DD");
        var eventFields = '?fields=name|description|startDateTime|endDateTime|address|location|groupId|icon'
        ajax.url = serviceBaseUrl + '/events/';
        ajax.contentType = 'application/json';
        ajax.headers['Version'] = '1.0';
        ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
        ajax.body = "";
        switch (this.ajaxCall) {
            case 'getGroup':
                ajax.method = 'GET';
                ajax.url = serviceBaseUrl + '/groups/' + this.groupId + '?fields=name|description|createdBy|administrators';
                break;
            case 'getEvents':
                ajax.method = 'GET';
                ajax.url += eventFields + '&groupids=' + this.groupId + '&filter=endDateTime>=' + currentDate;
                break;
            case 'getPastEvents':
                ajax.method = 'GET';
                ajax.url += eventFields + '&groupids=' + this.groupId + '&filter=endDateTime<' + currentDate; + '$AND$endDateTime>=' + pastDate;
                break;
            case 'postEvents':
                ajax.body = JSON.stringify(event);
                ajax.method = 'POST';
                break;
            case 'putEvents':
                //this.ajaxUrl += event.id;
                ajax.url += event.id;
                ajax.body = JSON.stringify(event);
                ajax.method = 'PUT';
                break;
            case 'deleteEvents':
                // TODO: Check if this.id has defined, convert this.ajaxUrl to local variable
                // this.ajaxUrl += event.id;
                ajax.url += event.id;
                ajax.method = 'DELETE';
                break;
            case 'eventsImage':
                var data = new FormData();
                var file = this.$.eventsImage.$.input.files[0];
                var fileName = this.eventObject.id + '.jpg';
                var dataURL = this.resizeImageSelection(file);
                data.append(fileName, dataURL);
                ajax.url = serviceBaseUrl + '/blob/';
                ajax.body = data;
                ajax.contentType = undefined;
                ajax.method = 'POST';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                ajax.headers['eventid'] = this.eventObject.id;
                this.fire("status-message-update", { severity: 'info', message: 'Image upload in progress...' });
                break;
        }
        ajax.generateRequest();
    },

    handleErrorResponse: function (e) {
        this.closeAddEventDialog();


        var errorResponse = e.detail.request.xhr.response;
        message = 'Server threw error. Check if you are logged in.';
        if (errorResponse !== null) {
            switch (errorResponse.errorcode) {
                case 'GenericHttpRequestException':
                    message = 'Oh! ohh! Looks like there is some internal issue. Please try again after some time.';
                    break;
                case 'EventNotExistant':
                    message = 'Event does not exist.';
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

    handleAjaxResponse: function (event) {
        switch (this.ajaxCall) {
            case 'getGroup':
                this.groupObject = event.detail.response;
                this.groupObject.createdBy = this.groupObject.createdBy ? this.groupObject.createdBy : 'Not Owner';
                this.groupObject.administrators = this.groupObject.administrators ? this.groupObject.administrators : ['Not Admin'];
                this.populateGroupDetails(this.groupObject);
                break;
            case 'getEvents':
            case 'getPastEvents':
                this.items = event.detail.response;
                this.populateGrid();
                this.fire("status-message-update");
                break;
            case 'postEvents':
                this.eventObject.id = event.detail.response.id;
                this.items.push(this.eventObject);
                if (this.isEventsImageChanged) {
                    this.uploadImage();
                    this.isEventsImageChanged = false;
                }
                else {
                    this.populateGrid();
                }
                break;
            case 'putEvents':
                var index = this.items.findIndex(e => e.id === this.eventObject.id);
                this.items[index] = this.eventObject;
                if (this.isEventsImageChanged) {
                    this.uploadImage();
                    this.isEventsImageChanged = false;
                }
                else {
                    this.fire("status-message-update");
                    this.populateGrid();
                }
                break;
            case 'deleteEvents':
                var index = this.items.findIndex(e => e.id === this.eventObject.id);
                this.items.splice(index, 1);
                this.populateGrid();
                break;
            case 'eventsImage':
                this.updateImageURL(event.detail.response.url);
                break;
        }
    },
    emptyGrid: function () {
        var grid = this.$.grid;
        grid.size = 0;
        grid.items = [];
    },
    populateGrid: function () {
        this.emptyGrid();
        var grid = this.$.grid;
        if (this.items.length) {
            grid.size = this.items.length;
            grid.items = this.items;
        }

        this.emptyEventFields();
        this.$.grid.style.display = '';

    },
    observers: ['resetSelection(inverted)'],
    resetSelection: function (inverted) {
        this.$.grid.selectedItems = [];
        this.updateStyles();
        this.indeterminate = false;
    },

    invert: function (e) {
        this.inverted = !this.inverted;
    },

    // iOS needs indeterminated + checked at the same time
    isChecked: function (inverted, indeterminate) {
        return indeterminate || inverted;
    },

    selectItem: function (e) {
        if (e.target.checked === this.inverted) {
            this.$.grid.deselectItem(e.model.item);
        } else {
            this.$.grid.selectItem(e.model.item);
        }
        this.indeterminate = this.$.grid.selectedItems.length > 0;
    },

    isSelected: function (inverted, selected) {
        return inverted != selected;
    },
    onActiveItemChanged: function (e) {
        this.$.grid.expandedItems = [e.detail.value];
    },
    formatDate: function (dateString) {
        return dateString ? moment(dateString).format('ddd MMM Do YYYY') : dateString;
    },
    formatTime: function (dateString) {
        return dateString ? moment(dateString).format('hh:mm a') : dateString;
    },
    formatDateTime: function (dateString) {
        return dateString ? moment(dateString).format('ddd MMM Do YYYY, hh:mm a') : dateString;
    },
    getTimeIn24HourFormat: function (time) {
        return moment(time, ["h:mm A"]).format("HH:mm");
    },
    getHoursIn24HourFormat: function (time) {
        return moment(time, ["h:mm A"]).format("HH");
    },
    getMinutes: function (time) {
        return moment(time, ["h:mm A"]).format("mm");
    },
    formatGroups: function (groupsList) {
        var returnValue = '';
        groupsList && groupsList.forEach(function (group, index) {
            returnValue += 'Name: ' + group.Name + '<br>' + 'WebSite: <a href =' + group.WebSite + '>' + group.WebSite + '</a>';
        });
        return returnValue;
    },
    editImage: function () {
        this.$.eventsImage.$.input.click();
    },
    uploadImage: function () {
        this.ajaxCall = 'eventsImage';
        this.makeAjaxCall();
    },
    updateImageURL: function (imageURL) {
        this.ajaxCall = 'putEvents';
        this.eventObject.icon = imageURL;
        this.fire("status-message-update", { severity: 'info', message: 'Events save in progress...' });
        this.makeAjaxCall(this.eventObject);
    },
    previewImage: function (e) {
        var inputElement = e.target.inputElement;
        if (inputElement.files && inputElement.files.length > 0) {
            if (this.isValidFileType(inputElement.files[0].type)) {
                var output = inputElement.files[0];
                this.displayContents(output);
                this.isEventsImageChanged = true;
            }
            else {
                inputElement.value = '';
                this.fire("status-message-update", { severity: 'error', message: 'Invalid file type selected. Please select an image to upload.' });
            }
        }
        else if (this.isEventsImageChanged) {
            this.previewSrc = '';
        }
    },
    displayContents: function (output) {
        this.previewSrc = window.URL.createObjectURL(output);
    },
    resizeImageSelection: function (file) {
        var myURL = window.URL || window.webkitURL;
        var img = this.$.previewImage;
        var imageWidth = 300, imageHeight = 200;
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
    isValidFileType: function (fileType) {
        if (fileType == 'image/jpg' || fileType == 'image/jpeg' || fileType == 'image/bmp' || fileType == 'image/png') {
            return true;
        }
        else {
            return false;
        }
    },

    openFile: function (e) {
        var inputElement = e.target.inputElement;
        if (inputElement.files && inputElement.files.length > 0) {
            if (this.isValidFileType(inputElement.files[0].type)) {
                var file = inputElement.files[0];

                var reader = new FileReader();
                var tmp_this = this;
                reader.onload = function () {
                    var text = reader.result;
                    tmp_this.parseICAL(text);
                    var result = tmp_this.getFutureEvents();
                };
                reader.readAsText(file);

            }
            else {
                inputElement.value = '';
                this.fire("status-message-update", { severity: 'error', message: 'Invalid file type selected. Please select an image to upload.' });
            }
        }
    },

    isValidFileType: function (fileType) {
        return fileType === 'text/calendar';
    },

    //https://github.com/thybag/JavaScript-Ical-Parser/blob/master/ical_parser.js
    parseICAL: function (data) {
        //Ensure cal is empty
        this.events = [];

        //Clean string and split the file so we can handle it (line by line)
        cal_array = data.replace(new RegExp("\\r", "g"), "").split("\n");

        //Keep track of when we are activly parsing an event
        var in_event = false;
        //Use as a holder for the current event being proccessed.
        var cur_event = null;
        for (var i = 0; i < cal_array.length; i++) {
            ln = cal_array[i];
            //If we encounted a new Event, create a blank event object + set in event options.
            if (!in_event && ln == 'BEGIN:VEVENT') {
                in_event = true;
                cur_event = {};
            }

            //If we encounter end event, complete the object and add it to our events array then clear it for reuse.

            if (in_event && ln == 'END:VEVENT') {
                in_event = false;
                this.events.push(cur_event);
                cur_event = null;
            }

            //If we are in an event
            if (in_event) {
                //Split the item based on the first ":"
                idx = ln.indexOf(':');
                //Apply trimming to values to reduce risks of badly formatted ical files.
                type = ln.substr(0, idx).replace(/^\s\s*/, '').replace(/\s\s*$/, '');//Trim
                val = ln.substr(idx + 1, ln.length - (idx + 1)).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                //If the type is a start date, proccess it and store details
                if (type == 'DTSTART') {
                    dt = this.makeDate(val);
                    val = dt.date;
                    //These are helpful for display
                    cur_event.start_time = dt.hour + ':' + dt.minute;
                    cur_event.start_date = dt.day + '/' + dt.month + '/' + dt.year;
                    cur_event.day = dt.dayname;
                }
                //If the type is an end date, do the same as above
                if (type == 'DTEND') {
                    dt = this.makeDate(val);
                    val = dt.date;
                    //These are helpful for display
                    cur_event.end_time = dt.hour + ':' + dt.minute;
                    cur_event.end_date = dt.day + '/' + dt.month + '/' + dt.year;
                    cur_event.day = dt.dayname;
                }
                //Convert timestamp
                if (type == 'DTSTAMP') val = this.makeDate(val).date;

                //Add the value to our event object.
                cur_event[type] = val;
            }
        }

        //Run this to finish proccessing our Events.
        this.complete();
    },

	/**
	 * complete
	 * Sort all events in to a sensible order and run the original callback
	 */
    complete: function () {
        //Sort the data so its in date order.
        this.events.sort(function (a, b) {
            return a.DTSTART - b.DTSTART;
        });
        //Run callback method, if was defined. (return self)
        if (typeof callback == 'function') callback(this);
    },

	/**
	 * getEvents
	 * return all events found in the ical file.
	 *
	 * @return list of events objects
	 */
    getEvents: function () {
        return this.events;
    },

	/**
	 * getFutureEvents
	 * return all events sheduled to take place after the current date.
	 *
	 * @return list of events objects
	 */
    getFutureEvents: function () {
        var future_events = [], current_date = new Date();
        this.events.forEach(function (itm) {
            //If the event starts after the current time, add it to the array to return.
            if (itm.DTSTART > current_date) future_events.push(itm);
        });
        return future_events;
    },

    makeDate: function (ical_date) {
        //break date apart
        var dt = {
            year: ical_date.substr(0, 4),
            month: ical_date.substr(4, 2),
            day: ical_date.substr(6, 2),
            hour: ical_date.substr(9, 2),
            minute: ical_date.substr(11, 2)
        }

        //Create JS date (months start at 0 in JS - don't ask)
        dt.date = new Date(dt.year, (dt.month - 1), dt.day, dt.hour, dt.minute);
        //Get the full name of the given day
        dt.dayname = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dt.date.getDay()];
        return dt;
    }
});