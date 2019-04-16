"use strict";
exports.__esModule = true;
var lean_cloud_1 = require("./lean_cloud");
var Storage = /** @class */ (function () {
    function Storage() {
        this.cloud = new lean_cloud_1["default"]();
    }
    Storage.prototype.addNewExperiment = function (id, user, description) {
        var route = '/classes/Experiments';
        var data = { 'ID': id, 'comment': description, 'user': user };
        return this.cloud.lean_cloud_post(route, data);
    };
    return Storage;
}());
exports["default"] = Storage;
//# sourceMappingURL=storage.js.map