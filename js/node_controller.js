"use strict";
exports.__esModule = true;
var connector_1 = require("./connector");
var NodeController = /** @class */ (function () {
    function NodeController(url) {
        var _this = this;
        //this.id = id;
        this.url = url;
        //let params = `?expId=${global_states['expID']}&id=${this.id}`;
        var done = function (resp) {
            console.log("resp=", resp);
            console.log("node initalized");
            _this.valid = true;
        };
        var fail = function (resp) {
            console.log("resp=", resp);
            console.log("node failed");
            _this.valid = false;
        };
        connector_1["default"].checkAlive(url, null, done, fail);
    }
    NodeController.prototype.configure = function (txGenerateInterval, txDelay, maxTxPerBlock) {
        // args might be null
        if (this.valid) {
            this.txGenerateInterval = txGenerateInterval;
            this.txDelay = txDelay;
            this.maxTxPerBlock = maxTxPerBlock;
        }
        else {
            throw new Error("invalid node! configuration failed");
        }
    };
    NodeController.prototype.start = function () {
        if (!this.valid) {
            throw new Error("node config is not valid");
            return;
        }
        console.log("start control delegation");
        this.createTransactionLocally();
    };
    NodeController.prototype.createTransactionLocally = function () {
        var randomAmount = Math.random() * 10;
        var recipient = Math.random().toString(36).substring(7);
        var sender = Math.random().toString(36).substring(7);
        var params = "transactions/new/get?amount=" + randomAmount + "&recipient=" + recipient + "&sender=" + sender;
        /*
        $.ajax({
            url: this.url + params,
            success:(resp)=>{
                console.log("tx created",resp);
            },
            error:(resp)=>{
                console.log("error found",resp);
            }
        })
        */
        var url;
        if ((this.url).endsWith("/")) {
            url = this.url + params;
        }
        else {
            url = this.url + "/" + params;
        }
        connector_1["default"].checkAlive(url);
    };
    return NodeController;
}());
exports["default"] = NodeController;
//# sourceMappingURL=node_controller.js.map