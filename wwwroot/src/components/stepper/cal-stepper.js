Polymer({
  is: 'cal-stepper',

  properties: {
    stepCount: {
      type: Number,
    },
    selectedIndex: {
      type: Number,
    }
  },
  ready: function () {
    var steps = [this.stepCount];
    for (var i = 0; i < this.stepCount; i++) {
      var color = (this.selectedIndex === i) ? 'blue' : 'grey';
      steps[i] = { color: color };
    }
    this.stepItems = steps;
  },
});