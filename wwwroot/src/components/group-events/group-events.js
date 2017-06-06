Polymer({
    is: 'group-events',
    properties: {
        page: {
            type: Number,
            notify: true,
            value: 0,
            observer: '_handlePageChanged',
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
    },
    ready: function () {
        var items = [];
        this.loadEvents();
    },
    loadEvents: function () {
        this.eventType = 'getEvents';
        this.makeAjaxCall()
    },
    showDialog: function (event) {
        this.$.saveevent.textContent = "Save";
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.addEvent);
        this.$.addEvent.open();
    },
    saveEvent: function (e) {
        this.eventObject = this.constructEventObject();
        this.eventType = this.eventObject.id ? 'putEvents' : 'postEvents';
        this.makeAjaxCall(this.eventObject);
        var dialog = this.$.addEvent;
        if (dialog) {
            dialog.close();
        }
    },
    cancelEvent: function (e) {
        this.emptyEventFields();
        var dialog = this.$.addEvent;
        if (dialog) {
            dialog.close();
        }
    },
    deleteEvents: function () {
        var grid = this.$.grid;
        //this.makeAjaxCall(grid.selectedItems);
    },
    deleteEvent: function (e) {
        this.eventType = 'deleteEvents';
        var deletedItem = e.model.item;
        this.makeAjaxCall(deletedItem);
    },
    editEvent: function (e) {
        var editedItem = e.model.item;
        this.showDialog();
        this.id = editedItem.id;
        this.name = editedItem.Name;
        this.description = editedItem.Description;
        this.startDateTime = editedItem.StartDateTime;
        this.endDateTime = editedItem.EndDateTime;
        this.streetNumber = editedItem.Address.StreetNumber;
        this.streetName = editedItem.Address.StreetName;
        this.city = editedItem.Address.City;
        this.state = editedItem.Address.State;
        this.postalCode = editedItem.Address.PostalCode;
        this.location = editedItem.Location;
        this.groups = editedItem.Groups;
        this.$.saveevent.textContent = "Update";
    },
    emptyEventFields: function () {
        this.id = null;
        this.name = null;
        this.description = null;
        this.startDateTime = null;
        this.endDateTime = null;
        this.streetNumber = null;
        this.streetName = null;
        this.city = null;
        this.state = null;
        this.postalCode = null;
        this.location = null;
        this.groups = null;
        this.eventObject = {};
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
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        // TODO: Consider removing this.ajaxUrl, use local variable as much as possible
        this.ajaxUrl = serviceBaseUrl + '/events';
        switch (this.eventType) {
            case 'getEvents':
                ajax.method = 'GET';
                ajax.headers['Version'] = '1.0';
                var loggedInUser = Polymer.globalsManager.globals.loggedInUser;
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'publishEvents':
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
                ajax.body = JSON.stringify(event);
                ajax.method = 'PUT';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                break;
            case 'deleteEvents':
                // TODO: Check if this.id has defined, convert this.ajaxUrl to local variable
                this.ajaxUrl += '/' + this.id;
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
        console.log('cal-events got error from ajax!');

        var req = e.detail.request;
        var jsonResponse = e.detail.request.xhr.response;
        var message = 'Error:';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText;

        this.$.msg.style.display = 'block';
        this.messageText = message;
    },

    handleAjaxResponse: function (event, a, b, c) {
        // var jsonResponse = e.detail.response;
        switch (this.eventType) {
            case 'getEvents':
                this.items = event.detail.response;
                this.populateGrid();
                break;
            case 'publishEvents':
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

                break;
        }
    },
    populateGrid: function () {
        var grid = this.$.grid;
        grid.size = 0;
        grid.items = [];

        grid.size = this.items.length;
        grid.items = this.items;
        this.emptyEventFields();
    },
    handleResponse: function (event) {
        console.log('handleResponse function is called');
        var grid = this.$.grid;
        this.items = event.detail.response;
        grid.size = this.items.length;
        grid.items = this.items;
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
        return dateString ? moment(dateString).format('ddd MMM Do YYYY, hh:mm a') : dateString;
    },
    formatGroups: function (groupsList) {
        var returnValue = '';
        groupsList && groupsList.forEach(function (group, index) {
            returnValue += 'Name: ' + group.Name + '<br>' + 'WebSite: <a href =' + group.WebSite + '>' + group.WebSite + '</a>';
        });
        return returnValue;
    }
});