"use strict";
exports.__esModule = true;
var lean_cloud_1 = require("./lean_cloud");
var storage_1 = require("./storage");
var states_1 = require("./states");
var connector_1 = require("./connector");
var node_controller_1 = require("./node_controller");
var utils_1 = require("./utils");
var data_fetcher_1 = require("./data_fetcher");
var node_manager_1 = require("./node_manager");
var top_button_controller_1 = require("./top_button_controller");
var configurations_1 = require("./configurations");
var cloud = new lean_cloud_1["default"]();
var globalUser;
function init_app() {
    $('#new_exp_id_create').hide();
    top_button_controller_1.setupTopButtons();
    cloud.lean_cloud_get("/classes/Experiments").done(function (resp) {
        //console.log('resp',resp);
        var expList = resp['results'];
        var options_html = "";
        //expList = expList.reverse();
        $.each(expList, function (_, exp) {
            var id = exp['ID'];
            var comment = exp['comment'];
            var user = exp['user'];
            //console.log(id,comment,user);
            var html = "<option class=\"display_experiment_comments\" comment=\"" + comment + "\" user=\"" + user + "\" style=\"padding:5px;\">" + id + " </option>";
            options_html = html + options_html;
        });
        $('#experimentIDModalSelect').html(options_html);
        $('.display_experiment_comments').on('click', function (obj) {
            //console.log('display_experiment_comments',obj.target);
            display_experiment_comments(obj.target);
        });
        $('#experimentIDModal').modal('show');
        console.log('app init');
    });
}
function display_experiment_comments(obj) {
    var comment = $(obj).attr('comment');
    var user_in_exp = $(obj).attr('user');
    globalUser = user_in_exp;
    var id = $(obj).html();
    if (comment && comment != 'undefined')
        $('#expIdDescription').html(comment + ("\nby " + user_in_exp));
    else
        $('#expIdDescription').html('No description given for ' + id + ("\nby " + user_in_exp));
}
function go_to_current_exp_view(obj) {
    $('.expid_link').removeClass('active');
    $(obj).addClass('active');
    $('#new_exp_id_create').hide();
    $('#choose_exp_id').fadeIn();
}
function go_to_create_exp_view(obj) {
    $('.expid_link').removeClass('active');
    $(obj).addClass('active');
    $('#choose_exp_id').hide();
    $('#new_exp_id_create').fadeIn();
}
function start_new_experiment(obj) {
    if ($('#new_exp_id_create').is(":visible")) {
        //check if the fields are filled
        var id_1 = ($('#experimentIDInput').val()).trim();
        var user_1 = $('#user_name_input').val().trim();
        var comment = $('#desc_input').val().trim();
        if (id_1.length > 0 && user_1.length > 0 && comment.length > 0) {
            var storage = new storage_1["default"]();
            storage.addNewExperiment(id_1, user_1, comment).done(function (resp) {
                console.log("new experiment added", resp);
                $('#expIDShow').html(id_1);
                $('#userShow').html(user_1);
                $('#experimentIDModal').modal('hide');
                states_1["default"]['expID'] = id_1;
            });
        }
        else {
            console.log("some fields are empty");
        }
    }
    else if ($('#choose_exp_id').is(":visible")) {
        var choice = $('#experimentIDModalSelect').find(":selected");
        if (choice.length == 0) {
            console.log("must choose one");
            return;
        }
        var id = choice.text();
        states_1["default"]['expID'] = id;
        console.log('choose', choice.text());
        $('#expIDShow').html(id);
        $('#userShow').html(globalUser);
        $('#experimentIDModal').modal('hide');
    }
}
$('#go_to_create_exp_view_btn').on('click', function (obj) {
    go_to_create_exp_view(obj);
});
$('#go_to_current_exp_view_btn').on('click', function (obj) {
    go_to_current_exp_view(obj);
});
$('#newExperientBtn').on('click', function (obj) {
    start_new_experiment(obj);
});
/*
    quick buttons
*/
function setupConnectionBtn() {
    $('.connect_btn').off('click');
    $('.connect_btn').on('click', function (obj) {
        console.log("connect button pressed", obj.target);
        var button = $(obj.target);
        var collaspe_id = $(button).attr('node_id');
        var node_item = $("#collapse_" + collaspe_id);
        if (button.html().trim() == 'Disconnect') {
            node_item.find('.ip_input').removeAttr('disabled');
            button.removeClass("btn-outline-primary");
            button.addClass("btn-primary");
            button.html("Connect");
            node_item.parent().find('.launchBtn').attr('disabled', 'disabled');
            button.closest('.card').find('.node-toggle-btn').css('color', 'gray');
            return;
        }
        console.log("node=", node_item);
        var ip_entered = node_item.find('.ip_input').val();
        var url = ip_entered.trim();
        if (!url) {
            console.log('no url provided');
            node_item.parent().find('.launchBtn').attr('disabled', 'disabled');
            button.closest('.card').find('.node-toggle-btn').css('color', 'gray');
            return;
        }
        url = utils_1["default"].convertToURL(url);
        console.log("url", url);
        var onSuccess = function (resp) {
            button.addClass("btn-outline-primary");
            button.removeClass("btn-primary");
            button.html("Disconnect");
            if (!states_1["default"].hasOwnProperty('NodeControllers')) {
                states_1["default"]['NodeControllers'] = new Array();
            }
            var nodeControllerList = states_1["default"]['NodeControllers'];
            //let url = Utils.convertToURL(ip,portNum);
            //let url = ip_entered.trim();
            var nodeController = new node_controller_1["default"](url.trim());
            //[i] = (nodeController);
            node_item.find('.ip_input').attr('disabled', 'disabled');
            console.log('nodeControllerList', nodeControllerList);
            data_fetcher_1.initNodeWithDefaults(url, collaspe_id);
            node_item.parent().find('.launchBtn').removeAttr('disabled');
            button.closest('.card').find('.node-toggle-btn').css('color', 'black');
            node_manager_1.setupCustomInspectionEvents();
            utils_1["default"].showTip("Connected", "This node is connected successfully.", "primary", 3);
        };
        var onFailure = function (resp) {
            node_item.find('.ip_input').removeAttr('disabled');
            button.removeClass("btn-outline-primary");
            button.addClass("btn-primary");
            button.html("Connect");
            button.closest('.card').find('.node-toggle-btn').css('color', 'gray');
            utils_1["default"].showTip("DisConnected", "This node cannot be connected.", "danger", 5);
        };
        connector_1["default"].checkAlive(url, null, onSuccess, onFailure);
    });
}
var _loop_1 = function (i) {
    var buttonName = '#saveConfigBtn_' + i;
    var button = $(buttonName);
    button.on('click', function (obj) {
        var btnParent = button.parent();
        var txGenerateInterval = (btnParent.find('.txGenerateInterval_input').val());
        var txRandomDelay = (btnParent.find('.txRandomDelay_input').val());
        var maxTranPerBlock = (btnParent.find('.maxTranPerBlock_input').val());
        var txGenerateIntervalNum = null;
        var txRandomDelayNum = null;
        var maxTranPerBlockNum = null;
        if (txGenerateInterval.trim() != '') {
            txGenerateIntervalNum = parseFloat(txGenerateInterval);
        }
        if (txRandomDelay.trim() != '') {
            txRandomDelayNum = parseFloat(txRandomDelay);
        }
        if (maxTranPerBlock.trim() != '') {
            maxTranPerBlockNum = parseInt(maxTranPerBlock);
        }
        if (!states_1["default"].hasOwnProperty('NodeControllers')) {
            utils_1["default"].showTip("Error", "No node is connected", "danger", 5);
            throw new Error("No node is connected");
            return;
        }
        var nodeControllerList = states_1["default"]['NodeControllers'];
        var nodeController = nodeControllerList[i];
        if (!nodeController.valid) {
            utils_1["default"].showTip("Error", "this node is invalid! Make sure it's connected.", "danger", 5);
            throw new Error("this node is invalid! Make sure it's connected.");
            return;
        }
        nodeController.configure(txGenerateIntervalNum, txRandomDelayNum, maxTranPerBlockNum);
        console.log("nodeController(" + i + ") is configured.", nodeController);
        utils_1["default"].showTip("Saved", "Configuration saved", "primary", 3);
    });
};
// //connect button
// for(let i:number=0;i<5;i++){
//     let buttonName = '#connectBtn_' + i;
//     let button = $(buttonName);
//     button.on('click',function(obj:any){
//         console.log("pressed",button);
//         if (button.html() == 'Connect'){
//             console.log("connect pressed");
//             let btnParent = button.parent();
//             //let id:string = <string>(btnParent.find('.id_input').val());
//             let ip:string = <string>(btnParent.find('.ip_input').val());
//             //let port:string = <string>(btnParent.find('.port_input').val());
//             //let portNum:number = parseInt(port);
//             let onSuccess = (resp:any)=>{
//                 button.addClass("btn-outline-primary");
//                 button.removeClass("btn-primary");
//                 button.html("Disconnect");
//                 if(!global_states.hasOwnProperty('NodeControllers')){
//                     global_states['NodeControllers'] = new Array<NodeController>();
//                 }
//                 let nodeControllerList = <NodeController[]>global_states['NodeControllers'];
//                 //let url = Utils.convertToURL(ip,portNum);
//                 let url = ip.trim();
//                 let nodeController = new NodeController(url.trim());
//                 nodeControllerList[i] = (nodeController);
//                 console.log('nodeControllerList',nodeControllerList);
//                 Utils.showTip("Connected","This node is connected successfully.","primary",3);
//             }
//             let onFailure = (resp:any)=>{
//                 button.removeClass("btn-outline-primary");
//                 button.addClass("btn-primary");
//                 button.html("Connect");
//                 Utils.showTip("DisConnected","This node cannot be connected.","danger",5);
//             }
//             let url = Utils.convertToURL(ip);
//             let buttonContent = `<div class="spinner-border spinner-border-sm" style="margin-right:5px;" role="status">
//                 <span class="sr-only">Loading...</span>
//                 </div>Connecting...`;
//             button.html(buttonContent);
//             Connector.checkAlive(url,null,onSuccess,onFailure);
//         }
//         else if(button.html() == 'Disconnect'){
//             let nodeControllerList = <NodeController[]>global_states['NodeControllers'];
//             nodeControllerList[i] = null;
//             button.removeClass("btn-outline-primary");
//             button.addClass("btn-primary");
//             button.html("Connect");
//             Utils.showTip("Connected","This node is now disconnected.","primary",3);
//         }
//         //console.log('connectBtn click',id,ip,port);
//     });
// }
//save conf button
for (var i = 0; i < 5; i++) {
    _loop_1(i);
}
var _loop_2 = function (i) {
    var buttonName = '#startOpBtn_' + i;
    var button = $(buttonName);
    button.on('click', function (obj) {
        var nodeControllerList = states_1["default"]['NodeControllers'];
        var nodeController = nodeControllerList[i];
        if (!nodeController.valid) {
            utils_1["default"].showTip("Error", "this node is invalid! Make sure it's connected.", "danger", 5);
            throw new Error("this node is invalid! Make sure it's connected.");
            return;
        }
        nodeController.start();
    });
};
//start op button
for (var i = 0; i < 5; i++) {
    _loop_2(i);
}
function getParameters() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var app = url.searchParams.get("app");
    var pwd = url.searchParams.get("pwd");
    if (app && pwd) {
        cloud.set_attr(app, pwd);
        configurations_1.lean_cloud_config['appId'] = app;
        configurations_1.lean_cloud_config['key'] = pwd;
        console.log("Using appID=" + app + " and pwd=" + pwd);
    }
    else {
        console.log("Using default settings: appID=" + configurations_1.lean_cloud_config.appId + " and pwd=" + configurations_1.lean_cloud_config.key);
    }
}
$('document').ready(function () {
    getParameters();
    init_app();
    node_manager_1.generateNodes(5);
    setupConnectionBtn();
});
//# sourceMappingURL=app.js.map