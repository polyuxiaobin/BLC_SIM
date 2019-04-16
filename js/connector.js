"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var Connector = /** @class */ (function () {
    function Connector() {
    }
    Connector.checkAlive = function (ip, port, done, fail) {
        var url_string;
        if (port)
            url_string = ip + ":" + port;
        else
            url_string = ip;
        $.ajax({ url: url_string })
            .done(function (resp) {
            console.log("success", resp);
            if (done)
                done(resp);
        })
            .fail(function (resp) {
            console.log("failed:" + ip, resp);
            if (fail)
                fail(resp);
        });
    };
    Connector.getResponse = function (url, data, done, fail) {
        var jsonp_name = utils_1["default"].getJSONPName();
        var params = {};
        if (data) {
            params = data;
        }
        params['jsonp'] = jsonp_name;
        if (url.startsWith('https://') || url.startsWith('http://')) {
            $.ajax({
                url: url,
                jsonp: 'jsonp',
                dataType: 'jsonp',
                jsonpCallback: jsonp_name,
                data: params
            })
                .done(function (resp) {
                if (done) {
                    done(resp);
                }
            })
                .fail(function (resp) {
                if (fail) {
                    fail(resp);
                }
            });
        }
        else {
            console.log("http or https should be used.");
        }
    };
    return Connector;
}());
exports["default"] = Connector;
//# sourceMappingURL=connector.js.map