Polymer({
    is: 'calendar-row',

    properties: {
        startDay: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
        startMonth: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
        startYear: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
        selectedDay: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
        selectedMonth: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
        selectedYear: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
    },

    listeners: {
        'on-cell-selected': 'cellSelectHandler'
    },

    _dateChanged: function (newValue, oldValue) {
        if (this.startMonth >= 0 && this.startYear >= 0 && this.startDay > -7 &&
            this.selectedMonth >= 0 && this.selectedYear >= 0 && this.selectedDay > -7) {
            this.calculateDays();
        }
    },

    calculateDays: function () {
        var days = [];
        var todaysDateTime = new Date();
        var todaysDate = new Date(todaysDateTime.getFullYear(), todaysDateTime.getMonth(), todaysDateTime.getDate()).getTime();
        var selectedDate = new Date(this.selectedYear, this.selectedMonth, this.selectedDay).getTime();

        for (var i = 0; i < 7; i++) {
            var date = new Date(this.startYear, this.startMonth, this.startDay + i);

            var day = date.getDate();
            var month = date.getMonth();
            var year = date.getFullYear();

            var selected = false;
            if (selectedDate) {
                selected = date.getTime() === selectedDate;
            }

            days.push({
                day: day,
                month: month,
                year: year,
                inactive: month !== this.startMonth,
                today: date.getTime() === todaysDate,
                selected: selected,
            });
        }
        this.dayList = days;
    },

    cellSelectHandler: function (e) {
        this.fire('on-date-selected', e.detail);
    },
});