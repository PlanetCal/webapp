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
    //console.log('cal-stepper ready method called!:');

    this.leftArrowVisible = this.selectedIndex !== 0;
    //this.rightArrowVisible = this.selectedIndex !== (this.stepCount - 1);
    this.rightArrowVisible = true;

    var steps = [this.stepCount];
    for (var i = 0; i < this.stepCount; i++) {
      steps[i] = { index: i };
    }
    this.stepItems = steps;
  },

  _stepTapHandler: function (e) {
    var index = e.detail.index;
    if (index === this.selectedIndex - 1) {
      this.previousHandler();
    } else if (index === this.selectedIndex + 1) {
      this.forwardHandler();
    }
  },

  previousHandler: function () {
    this.fire('--cal-stepper-previous-page-requested');
  },

  forwardHandler: function () {
    this.fire('--cal-stepper-next-page-requested');
  }
});