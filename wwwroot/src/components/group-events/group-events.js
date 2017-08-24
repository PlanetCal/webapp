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
        this.loadEvents();
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
        this.$.saveevent.textContent = "Save";
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
    dialogTest: function (element) {
        this.$.dialogTest.open();
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
    cancelEvent: function (e) {
        this.emptyEventFields();
    },

    deleteEvents: function () {
        var grid = this.$.grid;
        //this.makeAjaxCall(grid.selectedItems);
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
        this.streetNumber = editedItem.address.streetNumber;
        this.streetName = editedItem.address.streetName;
        this.city = editedItem.address.city;
        this.state = editedItem.address.state;
        this.postalCode = editedItem.address.postalCode;
        this.location = editedItem.location;
        this.groups = editedItem.groups;
        this.$.eventDialogHeader.textContent = "Update Event";
        this.$.saveevent.textContent = "Save";
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
        this.streetNumber = null;
        this.streetName = null;
        this.city = null;
        this.state = null;
        this.postalCode = null;
        this.location = null;
        this.groups = null;
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
        obj.address = {};
        obj.address.streetNumber = this.streetNumber;
        obj.address.streetName = this.streetName;
        obj.address.city = this.city;
        obj.address.state = this.state;
        obj.address.postalCode = this.postalCode;
        obj.location = this.location;
        obj.groups = [this.groupId];
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
        var fields = '?fields=name|description|startDateTime|endDateTime|address|location|groups'
        ajax.url = serviceBaseUrl + '/events/';
        ajax.headers['Version'] = '1.0';
        ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
        ajax.body = "";
        switch (this.ajaxCall) {
            case 'getEvents':
                ajax.method = 'GET';
                ajax.url += fields + '&groupids=' + this.groupId + '&filter=startDateTime>=' + currentDate; // + '$AND$startDateTime<=' + 2017 - 09 - 20;
                break;
            case 'getPastEvents':
                ajax.method = 'GET';
                ajax.url += fields + '&groupids=' + this.groupId + '&filter=startDateTime<' + currentDate; + '$AND$startDateTime>=' + pastDate;
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
            case 'getEvents':
            case 'getPastEvents':
                this.items = event.detail.response;
                this.populateGrid();
                this.fire("status-message-update");
                break;
            case 'postEvents':
                this.eventObject.id = event.detail.response.id;
                this.items.push(this.eventObject);
                this.populateGrid();
                break;
            case 'putEvents':
                var index = this.items.findIndex(e => e.id === this.eventObject.id);
                this.items[index] = this.eventObject;
                this.populateGrid();
                break;
            case 'deleteEvents':
                var index = this.items.findIndex(e => e.id === this.eventObject.id);
                this.items.splice(index, 1);
                this.populateGrid();
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
        grid.size = this.items.length;
        grid.items = this.items;
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
    }
});