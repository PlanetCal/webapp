Polymer({
  is: 'cal-step',

  properties: {
    index: {
      type: Number,
    },
    selectedIndex: {
      type: Number,
    },
  },

  ready: function () {
    switch (this.index) {
      case (this.selectedIndex):
        this.color = 'blue';
        break;
      case (this.selectedIndex - 1):
      case (this.selectedIndex + 1):
        this.color = 'activegrey';
        break;
      default:
        this.color = 'passivegrey';
        break;
    }
  },

  onTapHandler: function () {
    this.fire('cal-step-tapped', { index: this.index });
  },
});