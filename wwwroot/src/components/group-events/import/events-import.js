Polymer({
    is: 'events-import',
    properties: {
        groupId: {
            type: String,
            observer: 'pageLoad'
        },
        groupTypeToGoBack: {
            type: String,
            observer: 'pageLoad',
        },
    },
    ready: function () {
        this.pageLoad();
    },
    pageLoad: function () {
        this.fire("status-message-update");
    },
});