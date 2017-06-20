Polymer({
    is: 'calendar-cell',

    properties: {
        day: {
            type: Number,
            reflectToAttribute: true,
        },
        month: {
            type: Number,
            reflectToAttribute: true,
        },
        year: {
            type: Number,
            reflectToAttribute: true,
        },
        inactive: {
            type: Boolean,
            reflectToAttribute: true,
            observer: '_styleChanged'
        },
        selected: {
            type: Boolean,
            reflectToAttribute: true,
            observer: '_styleChanged'
        },
        today: {
            type: Boolean,
            reflectToAttribute: true,
            observer: '_styleChanged'
        },
    },

    _styleChanged: function () {
        if (this.inactive) {
            this.customStyle['--cal-cell-color'] = '#ccc';
        } else {
            this.customStyle['--cal-cell-color'] = 'default';
        }

        if (this.selected) {
            this.customStyle['--cal-cell-border'] = '1px solid coral';
        } else {
            this.customStyle['--cal-cell-border'] = 'default';
        }

        if (this.today) {
            this.customStyle['--cal-cell-background-color'] = 'yellow';
        } else {
            this.customStyle['--cal-cell-background-color'] = 'default';
        }

        this.updateStyles();
    },

    tapHandler: function () {
        this.fire('on-cell-selected', { day: this.day, month: this.month, year: this.year });
    },

});