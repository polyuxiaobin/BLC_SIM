"use strict";
exports.__esModule = true;
var node_manager_1 = require("./node_manager");
var states_1 = require("./states");
var traffic_manager_1 = require("./traffic_manager");
function setupTopButtons() {
    $('#startAllBtn').on('click', function (event) {
        console.log('start all nodes');
    });
    $('#addNewNodeBtn').on('click', function (event) {
        console.log('add new node');
        node_manager_1.addNewNode();
    });
    $('#loadConfBtn').on('click', function (event) {
        console.log('load conf');
    });
    $('#saveConfBtn').on('click', function (event) {
        console.log('save conf');
    });
    $('#new_inspect_btn').on('click', function (event) {
        console.log('save conf');
        node_manager_1.addNewInspectionPrompt();
    });
    $('#openTrafficCollectedBtn').on('click', function (event) {
        var expID = states_1["default"]['expID'];
        var cloud = states_1["default"]['cloud'];
        traffic_manager_1.TrafficManager.downloadExperimentData(expID, cloud);
    });
}
exports.setupTopButtons = setupTopButtons;
//# sourceMappingURL=top_button_controller.js.map