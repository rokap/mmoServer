module.exports = {
    debug: function (s, m) {
        var d = this.getFormattedDate();
        console.log(d + " | " + ((typeof s === 'object') ? s.id : s) + ": " + m);
    },
    getFormattedDate: function () {
        var date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }
};