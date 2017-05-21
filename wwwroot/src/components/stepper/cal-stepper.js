Polymer({
  is: 'cal-stepper',

  properties: {
    stepCount: {
      type: Number,
    },
    selectedIndex: {
      type: Number,
    },
    nextPage: {
      type: String,
      observer: '_dateChanged'
    },
    previousPage: {
      type: String,
      observer: '_dateChanged'
    },
  },

  ready: function () {
    var steps = [this.stepCount];
    for (var i = 0; i < this.stepCount; i++) {
      var color = (i === this.selectedIndex) ? 'blue' : 'grey';
      var link = '';
      var linktype = 'passiveLink';

      if (i === this.selectedIndex - 1) {
        link = this.previousPage;
        linktype = 'activeLink';
      } else if (i === this.selectedIndex + 1) {
        link = this.nextPage;
        linktype = 'activeLink';
      }
      steps[i] = { color: color, link: link, linktype: linktype };
    }
    this.stepItems = steps;
  },
});