Polymer({
  is: 'event-main',

  properties: {
    selectedDay: {
      type: Number,
    },
    selectedMonth: {
      type: Number,
    },
    selectedYear: {
      type: Number,
    },
    eventItems: {
      type: Array,
    },
    filteredEvents:
    {
      type: Array,
    }
  },

  getDate: function (date)
  {
     var dateTime = new Date(date);
     return dateTime.toDateString();
  },

  getVenue: function (item)
  {
     return item[0].Name;
  },

  getDuration: function (dateStart, dateEnd)
  {
    var startdateTime = new Date(dateStart);
    var endDateTime = new Date(dateEnd);
    var timeDiff = Math.abs(endDateTime.getTime() - startdateTime.getTime());
    
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays + " Days";
  },      
  
  getEvents: function (items, selectedMonth, selectedDay)
  {
    return items;
  }
});
