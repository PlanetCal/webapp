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

    onKeyPress: function (e) {
        if (e.keyCode == 13) { // Enter
            var q = this.searchInput;
            //q = 'site:mysite.com+' + q; // edit site here
            this.show = false;
        }
    }
});