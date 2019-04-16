"use strict";
exports.__esModule = true;
var connector_1 = require("./connector");
var utils_1 = require("./utils");
var TransactionInstance = /** @class */ (function () {
    function TransactionInstance(url, avgSec, stdSec, stopOnError, name, id) {
        if (stopOnError === void 0) { stopOnError = true; }
        this.url = url;
        this.avgSec = avgSec;
        this.stdSec = stdSec;
        this.stopOnError = stopOnError;
        this.name = name;
        this.id = id;
        if (name && id)
            this.label = "[" + id + "]" + name;
        else if (id)
            this.label = "[" + id + "]";
    }
    TransactionInstance.prototype.startGenerateTransaction = function () {
        var _this = this;
        var url = this.url;
        var avgSec = this.avgSec;
        var stdSec = this.stdSec;
        var stopOnError = this.stopOnError;
        var startTime;
        if (avgSec == 0) {
            return;
        }
        if (stdSec == 0) {
            startTime = avgSec * 1000;
        }
        else {
            startTime = avgSec * 1000 + utils_1["default"].getRandomInt(stdSec * 1000);
        }
        this.interval_handler = setInterval(function () {
            connector_1["default"].getResponse(url, null, function (resp) {
                console.log(_this.label + " transaction result=", resp);
                if (stdSec == 0) {
                    startTime = avgSec * 1000;
                }
                else {
                    startTime = avgSec * 1000 + utils_1["default"].getRandomInt(stdSec * 1000);
                }
            }, function (resp) {
                console.log('error in transaction', resp);
                if (stopOnError)
                    clearInterval(_this.interval_handler);
            });
        }, startTime);
    };
    TransactionInstance.prototype.stopGenerateTransaction = function () {
        if (this.interval_handler)
            clearInterval(this.interval_handler);
    };
    TransactionInstance.prototype.toString = function () {
        var url = this.url;
        var avgSec = this.avgSec;
        var stdSec = this.stdSec;
        var stopOnError = this.stopOnError;
        return url + "-" + avgSec + "-" + stdSec + "-" + stopOnError;
    };
    return TransactionInstance;
}());
exports.TransactionInstance = TransactionInstance;
//# sourceMappingURL=transaction_controller.js.map