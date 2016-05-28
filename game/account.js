var Account = function (_id, _created, _username, _firstname, _lastname, _active) {
    var netID,
        id = _id,
        created = _created,
        username = _username,
        firstname = _firstname,
        lastname = _lastname,
        active = _active;

    var set = function (name, value) {
        this[name] = value;
    };

    var get = function (name) {
        return this[name];
    };

    // Define which variables and methods can be accessed
    return {
        id: id,
        created: created,
        username: username,
        firstname: firstname,
        lastname: lastname,
        active: active,
        set: set,               // Global ability to set a variable
        get: get                // Global ability to get a variable
    }
};

// Export the Account class so you can use it in
// other files by using require("Account").Account
exports.Account = Account;