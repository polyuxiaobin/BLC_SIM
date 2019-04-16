"use strict";
exports.__esModule = true;
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.convertToURL = function (ip) {
        if (ip.startsWith('https://')) {
            return ip;
        }
        if (ip.startsWith('http://')) {
            return ip;
        }
        return "http://" + ip;
    };
    Utils.showTip = function (title, content, type, shownTime) {
        $('#information-tip').html("");
        $('#information-tip').show();
        var alertType = 'alert-' + type;
        var html = "<div class=\"alert " + alertType + " alert-dismissible fade show\" role=\"alert\">\n        <strong>" + title + "</strong> " + content + "\n        <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n          <span aria-hidden=\"true\">&times;</span>\n        </button>\n        </div>";
        $('#information-tip').html(html);
        if (shownTime) {
            $('#information-tip').fadeOut(shownTime * 1000);
        }
    };
    Utils.getJSONPName = function () {
        var today = new Date();
        var stamp = "resp_" + today.getFullYear() + "_" + today.getMonth() + "_" + today.getDay() + "_" + today.getHours() + "_" + today.getMinutes() + "_" + today.getMilliseconds();
        return stamp;
    };
    Utils.joinURL = function (base, route) {
        base = base.trim();
        route = route.trim();
        var pos0 = (base).endsWith("/");
        var pos1 = (route).startsWith("/");
        if (pos0) {
            base = base.substr(0, base.length - 1);
        }
        if (pos1) {
            route = route.substr(1);
        }
        return base.trim() + "/" + route.trim();
    };
    Utils.getRandomInt = function (max) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    return Utils;
}());
exports["default"] = Utils;
//# sourceMappingURL=utils.js.map