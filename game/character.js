var Character = function (_id, _account, _created, _name, _class, _race, _posX, _posY, _posZ, _rot) {
    var netID,
        id = _id,
        account = _account,
        created = _created,
        name = _name,
        class_ = _class,
        race = _race,
        posX = _posX,
        posY = _posY,
        posZ = _posZ,
        rot = _rot;

    var set = function (name, value) {
        this[name] = value;
    };

    var get = function (name) {
        return this[name];
    };

    // Define which variables and methods can be accessed
    return {
        id: id,
        account: account,
        created: created,
        name: name,
        class_: class_,
        race: race,
        posX: posX,
        posY: posY,
        posZ: posZ,
        rot: rot,
        set: set,               // Global ability to set a variable
        get: get                // Global ability to get a variable
    }
};

// Export the Account class so you can use it in
// other files by using require("Account").Account
exports.Character = Character;