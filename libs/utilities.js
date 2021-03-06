module.exports = {
    debug: function (s, m) {

        if (typeof s === 'object')
            var ip = s.request.connection.remoteAddress;

        var d = this.getFormattedDate();
        console.log("  " + d + ":\t" + ((typeof s === 'object') ? s.id + "\t(" + ip + ")" : s) + ":\t" + m);
    },
    getFormattedDate: function () {
        var date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }
};