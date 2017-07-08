Polymer({
    is: 'group-events',
    properties: {
        page: {
            type: Number,
            notify: true,
            value: 0,
            // observer: '_handlePageChanged',
        },
        inverted: {
            type: Boolean,
            value: false,
        },
        indeterminate: {
            type: Boolean,
            value: false,
        },
        eventObject: {
            type: Object,
            value: {},
        },
        eventType: {
            type: String,
            value: '',
        },
        isLoading: {
            type: Boolean,
            value: false,
            notify: true,
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
        //document.getElementsByClassName('.addEvent').validate();
    },
    validateOnChange: function (e) {
        e.target.validate();
    },
    pastEvents: function (e) {
        //this.emptyGrid();
        this.eventType = 'pastEvents';
        this.$.grid.style.display = 'none';
        this.$.btnPast.disabled = true;
        this.$.btnUpcoming.disabled = false;
        this.makeAjaxCall();
    },
    loadEvents: function () {
        //this.emptyGrid();
        this.fire("status-message-update", { severity: 'info', message: 'Loading events from server ...' });
        this.eventType = 'getEvents';
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
        Polymer.dom(body).appendChild(this.$.addEvent);
        this.$.addEvent.open();
        var elements = document.getElementsByClassName('addEvent');
        for (var i = 0; i < elements.length; i++) {
            elements[i].invalid = false;
        }
        elements[0].invalid = false;
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
        var dialog = this.$.addEvent;
        if (dialog) {
            dialog.close();
        }
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
            this.eventType = this.eventObject.id ? 'putEvents' : 'postEvents';
            this.makeAjaxCall(this.eventObject);
        }
    },
    cancelEvent: function (e) {
        this.emptyEventFields();
    },
    notLoggedInError: function (type) {
        alert('Please login to ' + type);
        return false;
    },
    deleteEvents: function () {
        var grid = this.$.grid;
        //this.makeAjaxCall(grid.selectedItems);
    },
    deleteEvent: function (e) {
        e.preventDefault();
        if (!Polymer.globalsManager.globals.loggedInUser) {
            return this.notLoggedInError('delete');
        }
        this.eventType = 'deleteEvents';
        this.eventObject = e.model.item;
        this.makeAjaxCall(e.model.item);
    },
    editEvent: function (e) {
        e.preventDefault();
        if (!Polymer.globalsManager.globals.loggedInUser) {
            return this.notLoggedInError('edit');
        }

        var editedItem = e.model.item;
        this.showDialog();
        this.id = editedItem.id;
        this.name = editedItem.Name;
        this.description = editedItem.Description;
        this.startDateTime = new Date(editedItem.StartDateTime);
        this.startDate = this.formatDate(editedItem.StartDateTime);
        this.startTime = this.formatTime(editedItem.StartDateTime);
        this.endDateTime = new Date(editedItem.EndDateTime);
        this.endDate = this.formatDate(editedItem.EndDateTime);
        this.endTime = this.formatTime(editedItem.EndDateTime);
        this.streetNumber = editedItem.Address.StreetNumber;
        this.streetName = editedItem.Address.StreetName;
        this.city = editedItem.Address.City;
        this.state = editedItem.Address.State;
        this.postalCode = editedItem.Address.PostalCode;
        this.location = editedItem.Location;
        this.groups = editedItem.Groups;
        this.$.eventDialogHeader.textContent = "Update Event";
        this.$.saveevent.textContent = "Update";
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
        var dialog = this.$.addEvent;
        if (dialog) {
            dialog.close();
        }
    },
    constructEventObject: function () {
        var obj = {};
        if (this.id && this.id !== 'null') {
            obj.id = this.id;
        }
        obj.Name = this.name;
        obj.Description = this.description;
        obj.StartDateTime = this.startDateTime;
        obj.EndDateTime = this.endDateTime;
        obj.Address = {};
        obj.Address.StreetNumber = this.streetNumber;
        obj.Address.StreetName = this.streetName;
        obj.Address.City = this.city;
        obj.Address.State = this.state;
        obj.Address.PostalCode = this.postalCode;
        obj.Location = this.location;
        obj.Groups = {};
        obj.Groups = this.groups ? this.groups : [];
        return obj;
    },
    makeAjaxCall: function (event = null) {
        //this.isLoading = true;
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
        // TODO: Consider removing this.ajaxUrl, use local variable as much as possible
        // this.ajaxUrl = serviceBaseUrl + '/events/';
        ajax.url = serviceBaseUrl + '/events/';
        switch (this.eventType) {
            case 'getEvents':
            case 'pastEvents':
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'postEvents':
                ajax.body = JSON.stringify(event);
                ajax.method = 'POST';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'putEvents':
                //this.ajaxUrl += event.id;
                ajax.url += event.id;
                ajax.body = JSON.stringify(event);
                ajax.method = 'PUT';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'deleteEvents':
                // TODO: Check if this.id has defined, convert this.ajaxUrl to local variable
                // this.ajaxUrl += event.id;
                ajax.url += event.id;
                // ajax.body = JSON.stringify(event.id);
                ajax.method = 'DELETE';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
        }
        ajax.generateRequest();
    },

    handleErrorResponse: function (e) {
        var dialog = this.$.addEvent;
        if (dialog) {
            dialog.close();
        }
        console.log('group-events got error from ajax!');
        this.fire("status-message-update", { severity: 'error', message: 'Error occurred on previous operation ...' });
        var req = e.detail.request;
        var jsonResponse = e.detail.request.xhr.response;
        var message = 'Error:';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText;

        // this.$.msg.style.display = 'block';
        // this.messageText = message;
    },

    handleAjaxResponse: function (event) {
        // var jsonResponse = e.detail.response;
        switch (this.eventType) {
            case 'getEvents':
            case 'pastEvents':
                //this.items = JSON.parse(event.detail.response);
                this.items = event.detail.response;
                this.populateGrid();
                this.fire("status-message-update", { severity: 'info', message: 'Successfully loaded events from server ...' });
                break;
            case 'postEvents':
                this.eventObject.id = event.detail.response.id;
                //var index = this.items.findIndex(e => e.Name === this.eventObject.Name);
                //this.items[index] = this.eventObject;
                this.items.push(this.eventObject);
                this.populateGrid();
                this.fire("status-message-update", { severity: 'info', message: 'Event saved successfully ...' });
                break;
            case 'putEvents':
                var index = this.items.findIndex(e => e.id === this.eventObject.id);
                this.items[index] = this.eventObject;
                this.populateGrid();
                this.fire("status-message-update", { severity: 'info', message: 'Event updated successfully ...' });
                break;
            case 'deleteEvents':
                var index = this.items.findIndex(e => e.id === this.eventObject.id);
                this.items.splice(index, 1);
                this.populateGrid();
                this.fire("status-message-update", { severity: 'info', message: 'Event deleted successfully ...' });
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