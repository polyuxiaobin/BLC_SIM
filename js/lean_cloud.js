"use strict";
exports.__esModule = true;
var configurations_1 = require("./configurations");
var Cloud = /** @class */ (function () {
    function Cloud() {
        this.appId = '';
        this.key = '';
        this.appId = configurations_1.lean_cloud_config.appId;
        this.key = configurations_1.lean_cloud_config.key;
    }
    Cloud.prototype.set_attr = function (appId, key) {
        this.appId = appId;
        this.key = key;
    };
    Cloud.prototype.lean_cloud_get = function (route, where) {
        var request_url = 'https://' + this.appId.substr(0, 8) + '.api.lncld.net/1.1' + route;
        var info = {
            type: 'GET',
            url: request_url,
            headers: { 'X-LC-Id': this.appId, 'X-LC-Key': this.key, "Content-Type": "text/plain;charset=UTF-8" }
            //xhrFields: {withCredentials: true}
        };
        if (where) {
            var whereStr = JSON.stringify(where);
            info["data"] = { "where": whereStr };
        }
        var promise = $.ajax(info);
        return promise;
    };
    Cloud.prototype.lean_cloud_post = function (route, data) {
        var request_url = 'https://' + this.appId.substr(0, 8) + '.api.lncld.net/1.1' + route;
        var info = {
            type: 'POST',
            url: request_url,
            headers: { 'X-LC-Id': this.appId, 'X-LC-Key': this.key, "Content-Type": "application/json;charset=UTF-8" },
            data: JSON.stringify(data),
            dataType: "json"
            //xhrFields: {withCredentials: true}
        };
        var promise = $.ajax(info);
        return promise;
    };
    Cloud.prototype.lean_cloud_put = function (class_name, objectID, data) {
        var route = class_name + "/" + objectID;
        var request_url = 'https://' + this.appId.substr(0, 8) + '.api.lncld.net/1.1/classes/' + route;
        var info = {
            type: 'PUT',
            url: request_url,
            headers: { 'X-LC-Id': this.appId, 'X-LC-Key': this.key, "Content-Type": "application/json;charset=UTF-8" },
            data: JSON.stringify(data),
            dataType: "json"
            //xhrFields: {withCredentials: true}
        };
        var promise = $.ajax(info);
        return promise;
    };
    Cloud.prototype.lean_cloud_delete = function (delete_class, delete_id, data) {
        var request_url = 'https://' + this.appId.substr(0, 8) + '.api.lncld.net/1.1/classes/' + delete_class + '/' + delete_id;
        var info = {
            type: 'DELETE',
            url: request_url,
            headers: { 'X-LC-Id': this.appId, 'X-LC-Key': this.key, "Content-Type": "application/json;charset=UTF-8" },
            dataType: "json"
            //xhrFields: {withCredentials: true}
        };
        var promise = $.ajax(info);
        return promise;
    };
    return Cloud;
}());
exports["default"] = Cloud;
//# sourceMappingURL=lean_cloud.js.map