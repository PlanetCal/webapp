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
    },
    ready: function () {
        console.log('Ready function is called');
        var items = [];
        this.loadEvents();
    },
    showDialog: function (event) {
        // var dialog = this.$.addEvent;
        // if (dialog) {
        //   dialog.open();
        // }

        this.$.saveevent.textContent = "Save";
        var body = document.querySelector('body');
        Polymer.dom(body).appendChild(this.$.addEvent);
        this.$.addEvent.open();
    },
    loadEvents: function () {
        this.makeAjaxCall('getEvents')
    },
    saveEvent: function () {
        //this.push('items', { Name: this.name, Description: this.description, DateTime: this.dateTime, Duration: this.duration, Groups: ['test'] });
        this.makeAjaxCall('postEvents');
        var grid = this.$.grid;
        grid.size = 0;
        grid.items = []
        // this.items.push({ Name: this.name, Description: this.description, DateTime: this.dateTime, Duration: this.duration, Groups: ['test'] });
        //this.items.push(this.items[0]);
        //grid.size = this.items.length;
        //grid.items = this.items;


        var dialog = this.$.addEvent;
        if (dialog) {
            dialog.close();
        }
    },
    deleteEvents: function () {
        var grid = this.$.grid;
        this.makeAjaxCall('deleteEvents', grid.selectedItems);
    },
    deleteEvent: function (e) {
        var deletedItem = e.model.item;
        this.makeAjaxCall('deleteEvents', deletedItem);
    },
    editEvent: function (e) {
        var editedItem = e.model.item;
        this.showDialog();
        this.name = editedItem.Name;
        this.description = editedItem.Description;
        this.dateTime = editedItem.DateTime;
        this.duration = editedItem.Duration;
        this.$.saveevent.textContent = "Update";
    },
    makeAjaxCall: function (type, eventsList = null) {
        var ajax = this.$.ajax;
        var serviceBaseUrl = Polymer.globalsManager.globals.serviceBaseUrl;
        this.ajaxUrl = serviceBaseUrl + '/events';
        switch (type) {
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
                this.ajaxBody = JSON.stringify({ Name: this.name });
                ajax.method = 'POST';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                //ajax.headers['Access-Control-Allow-Origin'] = '*';
                break;
            case 'deleteEvents':
                this.ajaxBody = JSON.stringify(eventsList);
                ajax.method = 'DELETE';
                ajax.headers['Version'] = '1.0';
                if (loggedInUser) {
                    ajax.headers['Authorization'] = 'Bearer ' + loggedInUser.token;
                }
                //ajax.headers['Access-Control-Allow-Origin'] = '*';
                break;
        }

        ajax.generateRequest();
    },

    handleErrorResponse: function (e) {
        console.log('cal-events got error from ajax!');

        var req = e.detail.request;
        var jsonResponse = e.detail.request.xhr.response;
        var message = 'Events fetch failed.';
        message = message + ' Here are the Details: Error Status: ' + req.status + ' Error StatusText: ' + req.statusText;

        this.$.msg.style.display = 'block';
        this.messageText = message;
    },

    handleAjaxResponse: function (event) {
        // var jsonResponse = e.detail.response;
        var grid = this.$.grid;
        this._response = event.detail.response;
        this.items = event.detail.response;
        grid.size = this.items.length;
        grid.items = this.items;
    },
    _handleResponse: function (event) {
        console.log('_handleResponse function is called');
        var grid = this.$.grid;
        this._response = event.detail.response;
        this.items = event.detail.response;
        grid.size = this.items.length;
        grid.items = this.items;
    },
    observers: ['_resetSelection(inverted)'],
    _resetSelection: function (inverted) {
        this.$.grid.selectedItems = [];
        this.updateStyles();
        this.indeterminate = false;
    },

    _invert: function (e) {
        this.inverted = !this.inverted;
    },

    // iOS needs indeterminated + checked at the same time
    _isChecked: function (inverted, indeterminate) {
        return indeterminate || inverted;
    },

    _selectItem: function (e) {
        if (e.target.checked === this.inverted) {
            this.$.grid.deselectItem(e.model.item);
        } else {
            this.$.grid.selectItem(e.model.item);
        }
        this.indeterminate = this.$.grid.selectedItems.length > 0;
    },

    _isSelected: function (inverted, selected) {
        return inverted != selected;
    }
});