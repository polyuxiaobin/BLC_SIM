"use strict";
exports.__esModule = true;
var node_manager_1 = require("./node_manager");
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
}
exports.setupTopButtons = setupTopButtons;
//# sourceMappingURL=top_button_controller.js.map