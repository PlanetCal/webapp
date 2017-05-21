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
        this.disabled = true;
        break;
      case (this.selectedIndex - 1):
      case (this.selectedIndex + 1):
        this.color = 'activegrey';
        this.disabled = false;
        break;
      default:
        this.color = 'passivegrey';
        this.disabled = true;
        break;
    }
  },

  onTapHandler: function () {
    this.fire('cal-step-tapped', { index: this.index });
  },
});