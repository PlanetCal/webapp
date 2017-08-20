Polymer({
    is: 'cal-calendar',

    properties: {
        month: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
        year: {
            type: Number,
            reflectToAttribute: true,
            observer: '_dateChanged'
        },
    },

    _dateChanged: function () {
        this.displayCalendar(true);
    },

    listeners: {
        'on-date-selected': 'dateSelectHandler'
    },

    ready: function () { //triggered when the component is loaded.
        this.displayCalendar(false);
    },

    displayCalendar: function (dateChanged) {
        var monthLocal, yearLocal;

        if ((this.month >= 0 && !(this.year > 0)) ||
            (!(this.month >= 0) && this.year > 0)) {
            return;
        }

        if (this.month >= 0 && this.year > 0) {
            if (!dateChanged) {
                return;
            }
            monthLocal = this.month;
            yearLocal = this.year;
        } else {
            var today = new Date();
            monthLocal = today.getMonth(); //January is 0!
            yearLocal = today.getFullYear();
        }

        this._month = monthLocal;
        this._year = yearLocal;
        //this.drawCalendar();

        if (!this.selectedDate) {
            this.selectDateAndDrawCalendar();
        } else {
            this.drawCalendar();
        }
    },

    drawCalendar: function (month, year) {
        console.log('cal-calendar drawCalendar called!:');


        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.daysNames = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];

        this.monthYearDisplay = monthNames[this._month] + " " + this._year;
        var daysInThisMonth = new Date(this._year, this._month + 1, 0).getDate();
        var dayIndexOfTheStartOfThisMonth = new Date(this._year, this._month, 1).getDay();

        var days = [];
        var currentDayPointer = 1 - dayIndexOfTheStartOfThisMonth;
        while (currentDayPointer <= daysInThisMonth) {
            days.push({ day: currentDayPointer });
            currentDayPointer = currentDayPointer + 7;
        }

        this.dayList = days;
    },

    todayhandler: function () {
        var today = new Date();
        this._month = today.getMonth(); //January is 0!
        this._year = today.getFullYear();

        this.selectDateAndDrawCalendar(today.getFullYear(), today.getMonth(), today.getDate());
    },

    tomorrowhandler: function () {
        var today = new Date();
        this._month = today.getMonth(); //January is 0!
        this._year = today.getFullYear();

        this.selectDateAndDrawCalendar(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    },

    backhandler: function () {
        var today = new Date();
        var todaysMonth = today.getMonth(); //January is 0!
        var todaysYear = today.getFullYear();

        // if (todaysMonth === 0) {
        //     todaysMonth = 11;
        //     todaysYear = todaysYear - 1;
        // } else {
        //     todaysMonth = todaysMonth - 1;
        // }

        if (this._month === todaysMonth && this._year === todaysYear) {
            return;
        }

        if (this._month === 0) {
            this._month = 11;
            this._year = this._year - 1;
        } else {
            this._month = this._month - 1;
        }
        this.drawCalendar();
    },

    forwardhandler: function () {
        if (this._month === 11) {
            this._month = 0;
            this._year = this._year + 1;
        } else {
            this._month = this._month + 1;
        }
        this.drawCalendar();
    },

    dateSelectHandler: function (e) {
        this.selectDateAndDrawCalendar(e.detail.year, e.detail.month, e.detail.day);
    },

    selectDateAndDrawCalendar: function (year, month, day) {
        var todaysDateTime = new Date();
        var todayDay = todaysDateTime.getDate();
        var todayYear = todaysDateTime.getFullYear();
        var todayMonth = todaysDateTime.getMonth();

        var isItToday = false;
        if (!day) {
            year = todayYear;
            month = todayMonth;
            day = todayDay;
            isItToday = true;
        } else {
            if (year === todayYear && month === todayMonth && day === todayDay) {
                isItToday = true;
            }
        }

        var daysNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var dayIndex = new Date(year, month, day).getDay();

        this._selectedDay = day;
        this._selectedMonth = month;
        this._selectedYear = year;

        this.drawCalendar();

        this._selectedDate = daysNames[dayIndex] + ", " + monthNames[month] + " " + day;

        if (isItToday) {
            this._selectedDate = "Today, " + this._selectedDate;
        }

        var selectedDate = {
            day: this._selectedDay,
            month: this._selectedMonth + 1,
            year: this._selectedYear
        }

        Polymer.globalsManager.set('selectedDate', selectedDate);

        this.fire('on-cal-date-selected');
    }
});