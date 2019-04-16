"use strict";
exports.__esModule = true;
var connector_1 = require("./connector");
var MiningInstance = /** @class */ (function () {
    function MiningInstance(url, stopOnError, name, id) {
        if (stopOnError === void 0) { stopOnError = true; }
        this.url = url;
        this.stopOnError = stopOnError;
        this.name = name;
        this.id = id;
        this.continue_mining = false;
        if (name && id)
            this.label = "[" + id + "]" + name;
        else if (id)
            this.label = "[" + id + "]";
    }
    MiningInstance.prototype.startMiningRecursive = function (url, stopOnError) {
        var _this = this;
        if (stopOnError === void 0) { stopOnError = true; }
        if (!this.continue_mining) {
            return;
        }
        connector_1["default"].getResponse(url, null, function (resp) {
            console.log(_this.label + " mining result=", resp);
            _this.startMiningRecursive(url, stopOnError);
        }, function (resp) {
            console.log('error in mining', resp);
        });
    };
    MiningInstance.prototype.startMining = function () {
        this.continue_mining = true;
        this.startMiningRecursive(this.url, this.stopOnError);
    };
    MiningInstance.prototype.stopMining = function () {
        this.continue_mining = false;
    };
    MiningInstance.prototype.toString = function () {
        return this.url + "-" + this.stopOnError;
    };
    return MiningInstance;
}());
exports.MiningInstance = MiningInstance;
//# sourceMappingURL=mine_controller.js.map