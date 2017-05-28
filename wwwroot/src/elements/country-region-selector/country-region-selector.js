Polymer({
  is: 'country-region-selector',

  properties: {
    countryValue: {
      type: String,
      observer: '_inputChanged'
    },
    regionValue: {
      type: String,
      observer: '_inputChanged'
    },
  },

  countryEmptyLabel: "Select Country",
  countryUseShortcode: true,
  countryDropdownName: "country",
  targetRegionDropdownId: null,
  regionBlankOption: "-",
  regionEmptyLabel: "Select Region",
  regionDropdownName: "region",

  ready: function () {
    this._inputChanged();
  },

  _inputChanged: function () {
    this.populateCountryField();

    // if the user's targeting their own <select> for the regions, hide the default one
    if (this.targetRegionDropdownId !== null) {
      if (!document.getElementById(this.targetRegionDropdownId)) {
        console.error("Invalid targetRegionDropdownId for the country-region-selector element. This component won't work until this problem is resolved.")
        return;
      }
      this.$.region.style.display = "none";
    }

    this.populateRegionField(this.regionValue);
  },

  countrySelectionChanged: function () {
    this.populateRegionField();
    this.fire('--on-country-changed', { countryValue: this.$.country.value });
  },

  regionSelectionChanged: function () {
    this.fire('--on-region-changed', { regionValue: this.$.region.value });
  },

  populateCountryField: function () {
    var html = '<option value="">' + this.countryEmptyLabel + '</option>';
    for (var i = 0; i < _data.length; i++) {
      var val = (this.countryUseShortcode) ? _data[i][1] : _data[i][0];
      var selected = this.countryValue !== null && this.countryValue === val;
      html += '<option value="' + val + '" ' + (selected ? ' selected="selected"' : '') + '>' + _data[i][0] + '</option>';
    }
    this.$.country.innerHTML = html;
  },

  resetRegionField: function () {
    var blankOptionHTML = '<option value="">' + this.regionBlankOption + '</option>';
    if (this.targetRegionDropdownId !== null) {
      document.getElementById(this.targetRegionDropdownId).innerHTML = blankOptionHTML;
    } else {
      this.$.region.innerHTML = blankOptionHTML;
    }
  },

  populateRegionField: function (defaultValue) {
    if (this.$.country.value === "") {
      this.resetRegionField();
    } else {
      var html = '<option value="">' + this.regionEmptyLabel + '</option>';
      var index = this.$.country.options.selectedIndex - 1;
      var regions = _data[index][2].split("|");

      for (var i = 0; i < regions.length; i++) {
        var selected = defaultValue !== null && regions[i] === defaultValue;
        html += '<option value="' + regions[i] + '" ' + (selected ? ' selected="selected"' : '') + '>' + regions[i] + '</option>';
      }
      if (this.targetRegionDropdownId !== null) {
        document.getElementById(this.targetRegionDropdownId).innerHTML = html;
      } else {
        this.$.region.innerHTML = html;
      }
    }
  }
});