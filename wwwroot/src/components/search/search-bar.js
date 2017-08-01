Polymer({
    is: 'search-bar',

    properties: {
        show: {
            type: Boolean,
            value: true
        },
        searchInput: {
            type: String,
            value: ''
        }
    },

    isEnterPressed: function (e) {
        if (e.keyCode == 13) { // Enter
            this.searchPressed()
        }
    },

    searchPressed: function () {
        this.fire('search-pressed', { searchInput: this.searchInput });
    },

    toggleSearch: function (e) {
        if (e) { // comes first
            e.stopPropagation();
        }
        if (e.target === this.$.input) {
            return;
        }
        this.show = !this.show;
        this.async(function () {
            this.$.input.focus();
        });
    },

});