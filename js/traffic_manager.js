"use strict";
exports.__esModule = true;
var TrafficManager = /** @class */ (function () {
    function TrafficManager() {
    }
    TrafficManager.downloadExperimentData = function (expID, cloud) {
        var whereObj = { "experimentId": expID.trim() };
        cloud.lean_cloud_get("/classes/Requests", whereObj).done(function (resp) {
            //let stringData = JSON.stringify(resp, null, 4);
            var resultWindow = window.open("", "Traffic Collected in Experiment");
            resultWindow.document.write("<title>Traffic In " + expID + "</title><div id='trafficDisplay'></div>");
            var contentDiv = $('#trafficDisplay', resultWindow.document);
            var div = (contentDiv);
            div.jsonViewer(resp, { collapsed: false, rootCollapsable: false });
        });
    };
    return TrafficManager;
}());
exports.TrafficManager = TrafficManager;
;
//# sourceMappingURL=traffic_manager.js.map