Polymer({
  is: 'cal-stepper',

  properties: {
    stepCount: {
      type: Number,
    },
    selectedIndex: {
      type: Number,
    },
  },

  listeners: {
    'cal-step-tapped': '_stepTapHandler'
  },
  ready: function () {
    var steps = [this.stepCount];
    for (var i = 0; i < this.stepCount; i++) {
      steps[i] = { index: i };
    }
    this.stepItems = steps;
  },

  _stepTapHandler: function (e) {
    var index = e.detail.index;
    if (index === this.selectedIndex - 1) {
      this.fire('--cal-stepper-previous-page-requested');
    } else if (index === this.selectedIndex + 1) {
      this.fire('--cal-stepper-next-page-requested');
    }
  },
});