"use strict";
exports.__esModule = true;
var utils_1 = require("./utils");
var mine_controller_1 = require("./mine_controller");
var transaction_controller_1 = require("./transaction_controller");
var connector_1 = require("./connector");
var miningInstanceMap = {};
var transactionInstanceMap = {};
function setupAppConfSaveButton(base_url) {
    //update_conf
    $('.save_conf_button_wrapper>button').on('click', function (event) {
        var button = (event.target);
        //app_conf_input_wrapper
        var user_setting_content = $(button).parent().parent().find('.user_setting_content');
        var inputs = user_setting_content.find('.app_conf_input_wrapper>input');
        var consensus = $(button).parent().parent().find('.consensus_loaded_p>input').val();
        var updated_values = {};
        $.each(inputs, function (_, input) {
            console.log("input", input);
            var type = $(input).attr("type");
            var param = $(input).attr("param");
            var value = $(input).val();
            value = value.trim();
            if (value) {
                if (type == "number") {
                    var intValue = parseInt(value);
                    var floatValue = parseFloat(value);
                    if (intValue == floatValue) {
                        value = intValue;
                    }
                    else {
                        value = floatValue;
                    }
                }
                updated_values[param] = value;
            }
        });
        console.log("updated=", updated_values, "consensus=", consensus);
        var data = {
            "data": JSON.stringify(updated_values),
            "consensus": consensus.toLowerCase()
        };
        var url = utils_1["default"].joinURL(base_url, "/update_conf");
        connector_1["default"].getResponse(url, data, function (resp) {
            console.log("update_conf", resp);
            if (resp.success)
                utils_1["default"].showTip("Configuration Updated", "Configuration for consensus " + consensus + " is now updated", 'primary', 3);
            else
                utils_1["default"].showTip("Configuration Updation Failed", resp['message'], 'danger', 3);
        }, function (resp) {
            console.log("error in update_conf", resp);
            utils_1["default"].showTip("Configuration Updation Failed", "Error in connection", 'danger', 3);
        });
    });
}
exports.setupAppConfSaveButton = setupAppConfSaveButton;
function setupLaunchBehaviors() {
    $('.launchBtn').off('click');
    $('.launchBtn').on('click', function (event) {
        var button = (event.target);
        //console.log
        var isRunning = $(button).attr('running');
        var node_order = parseInt($(button).attr('node_order'));
        var selector = $(button).parent().find('.btn.btn-link').attr('data-target');
        var div = $(selector);
        var ip = div.find('.ip_input').val();
        var txRoute = div.find('.tx_route_wrapper>input').val();
        var txGenerateInterval = div.find('.txGenerateInterval_input').val();
        //let txRandomDelay = div.find('.txRandomDelay_input').val();
        var mineRoute = div.find('.mining_route_wrapper>input').val();
        var node_name = div.find('.node_id_value').val();
        if (!txGenerateInterval) {
            txGenerateInterval = 0;
        }
        else {
            txGenerateInterval = parseFloat(txGenerateInterval);
        }
        /*
        if(!txRandomDelay){
            txRandomDelay = 0;
        }
        else{
            txRandomDelay = parseFloat(<string>txRandomDelay);
        }
        */
        console.log(ip, txRoute, txGenerateInterval, mineRoute);
        if (!(ip || mineRoute)) {
            utils_1["default"].showTip('Information Missing', 'Please make sure Action Route in mine is not empty.', 'danger', 4);
            return;
        }
        var url = utils_1["default"].convertToURL(ip);
        var miningURL = null;
        if (mineRoute)
            miningURL = utils_1["default"].joinURL(url, mineRoute);
        var txURL = utils_1["default"].joinURL(url, txRoute);
        var mineInstance = miningInstanceMap[selector];
        var txInstance = transactionInstanceMap[selector];
        var stopOnError = true;
        var txString = txURL + "-" + txGenerateInterval + "-" + 0 + "-" + stopOnError;
        var mineString = miningURL + "-" + stopOnError;
        var txStopOnError = false;
        var mineStopOnError = false;
        if (isRunning.trim() == "true") {
            $(button).attr('running', 'false');
            setButtonState(button, false, div);
            if (!mineInstance) {
                $(button).attr('running', 'false');
                return;
            }
            mineInstance.stopMining();
            if (!txInstance) {
                $(button).attr('running', 'false');
                return;
            }
            txInstance.stopGenerateTransaction();
        }
        else {
            //miningInstanceList
            $(button).attr('running', 'true');
            setButtonState(button, true, div);
            if (!mineInstance || mineInstance.toString() != mineString) {
                miningInstanceMap[selector] = new mine_controller_1.MiningInstance(miningURL, mineStopOnError, node_name, node_order);
                mineInstance = miningInstanceMap[selector];
            }
            if (!txInstance || txInstance.toString() != txString) {
                transactionInstanceMap[selector] = new transaction_controller_1.TransactionInstance(txURL, txGenerateInterval, 0, txStopOnError, node_name, node_order);
                txInstance = transactionInstanceMap[selector];
            }
            mineInstance.startMining();
            txInstance.startGenerateTransaction();
        }
        console.log("min_map=", miningInstanceMap);
        console.log("tx_map=", transactionInstanceMap);
    });
}
exports.setupLaunchBehaviors = setupLaunchBehaviors;
function setCloseBtnBehavior() {
    $('.closeBtn').off('click');
    $('.closeBtn').on('click', function (event) {
        var button = (event.target);
        var running = $(button).closest('.mb-0').find('.launchBtn').attr('running').trim();
        console.log("isRunning=", running);
        if (running == "true") {
            //not allowed
            utils_1["default"].showTip("Deletion Forbidden", "It's not allowed to delete a running node", "danger", 5);
            return;
        }
        else {
            $(button).find('.btn.btn-link').attr('data-target');
            var node_num = $(button).closest('.closeBtn').attr('node_order');
            var selector = "#collapse_" + node_num;
            delete (miningInstanceMap[selector]);
            delete (transactionInstanceMap[selector]);
            console.log("min_map=", miningInstanceMap);
            console.log("tx_map=", transactionInstanceMap);
            utils_1["default"].showTip("Deleted", "Node " + node_num + " is deleted", "primary", 3);
            var card_1 = $(button).closest('.card');
            card_1.fadeOut("slow", "linear", function () {
                card_1.remove();
            });
        }
    });
}
exports.setCloseBtnBehavior = setCloseBtnBehavior;
function setButtonState(button, isRunning, div) {
    if (isRunning) {
        var html = "<span style=\"margin-right:5px;\">\n            <div class=\"spinner-border spinner-border-sm\" role=\"status\">\n            <span class=\"sr-only\">Loading...</span>\n          </div></span>Stop";
        $(button).html(html);
        div.find('.ip_input').attr('disabled', 'disabled');
        div.find('.tx_route_wrapper>input').attr('disabled', 'disabled');
        div.find('.txGenerateInterval_input').attr('disabled', 'disabled');
        div.find('.txRandomDelay_input').attr('disabled', 'disabled');
        div.find('.mining_route_wrapper>input').attr('disabled', 'disabled');
        div.find('.connect_btn').attr('disabled', 'disabled');
        div.find('.app_conf_input_wrapper>input').attr('disabled', 'disabled');
        div.find('.save_conf_button_wrapper>button').attr('disabled', 'disabled');
        return;
    }
    else {
        var html = "<span style=\"margin-right:5px;\">\n            <i class=\"fas fa-play\"></i>  \n        </span>Start";
        $(button).html(html);
        div.find('.ip_input').removeAttr('disabled');
        div.find('.tx_route_wrapper>input').removeAttr('disabled');
        div.find('.txGenerateInterval_input').removeAttr('disabled');
        div.find('.txRandomDelay_input').removeAttr('disabled');
        div.find('.mining_route_wrapper>input').removeAttr('disabled');
        div.find('.connect_btn').removeAttr('disabled');
        div.find('.app_conf_input_wrapper>input').removeAttr('disabled');
        div.find('.save_conf_button_wrapper>button').removeAttr('disabled');
        return;
    }
}
function addNewNode() {
    var buttons = $('#generated').find('.launchBtn');
    var node_orders = [];
    $.each(buttons, function (_, button) {
        var node_order = parseInt($(button).attr('node_order'));
        node_orders.push(node_order);
    });
    var startNum = Math.max.apply(Math, node_orders) + 1;
    generateNodes(1, startNum, true, true);
}
exports.addNewNode = addNewNode;
function generateNodes(num, from, append, animated) {
    if (from === void 0) { from = 1; }
    if (append === void 0) { append = false; }
    if (animated === void 0) { animated = false; }
    var html = "";
    var originalNodeNumber = 0;
    for (var i = from; i < from + num; i++) {
        if (animated)
            html += generateTemplateForNode(i, false);
        else
            html += generateTemplateForNode(i);
    }
    if (append) {
        //let origin = $('#generated').html();
        originalNodeNumber = $('#generated').find('.card').length;
        $('#generated').append(html);
    }
    else {
        $('#generated').html(html);
    }
    if (animated) {
        var nodes = $('#generated').find('.card');
        var currentLength = nodes.length;
        nodes.removeClass("d-none");
        for (var i = originalNodeNumber; i < currentLength; i++) {
            //added.push(nodes[i]);
            $(nodes[i]).hide();
        }
        //let added = [];
        for (var i = originalNodeNumber; i < currentLength; i++) {
            //added.push(nodes[i]);
            $(nodes[i]).fadeIn('slow');
        }
    }
    else {
    }
    $('.node_collapse').collapse("hide");
    var input_any = ($('.ip_input'));
    var route_list = [];
    for (var i = 8081; i <= 8100; i++) {
        route_list.push("127.0.0.1:" + i);
    }
    input_any.autocomplete({ source: route_list });
    setCloseBtnBehavior();
}
exports.generateNodes = generateNodes;
function generateTemplateForNode(id, visible) {
    if (visible === void 0) { visible = true; }
    var d_none = "";
    if (!visible) {
        d_none = "d-none";
    }
    var html = "\n    <div class=\"card " + d_none + "\">\n        <div class=\"card-header\" id=\"heading" + id + "\">\n          <h2 class=\"mb-0\" style=\"display: flex;\n          justify-content: space-between;\">\n          <div>\n            <button class=\"btn btn-link node-toggle-btn\" style=\"color:gray\" type=\"button\" data-toggle=\"collapse\" data-target=\"#collapse_" + id + "\" aria-expanded=\"true\" aria-controls=\"collapse_" + id + "\">\n              <i class=\"fas fa-server icon-right-margin\"></i>Node " + id + " \n            </button>\n    \n            <button class=\"btn btn-secondary btn-sm launchBtn\" disabled type=\"button\" running=\"false\" node_order=\"" + id + "\">\n                  <span style=\"margin-right:5px;\">\n                      <i class=\"fas fa-play\"></i>  \n                  </span>Start\n              </button>\n           </div>\n           <div>\n                    <button class=\"btn btn-link btn-sm closeBtn\" type=\"button\" running=\"false\" node_order=\"" + id + "\" style=\"color:black;\">\n                    <span style=\"margin-right:5px;\">\n                        <i class=\"fas fa-times\"></i> \n                    </span>\n                </button>\n           </div> \n          </h2>\n        </div>\n    \n        <div id=\"collapse_" + id + "\" class=\"node_collapse collapse show\" aria-labelledby=\"headingOne\" data-parent=\"#accordionExample\">\n          <div class=\"card-body\">\n             \n             <div class=\"node_details\">\n               <div class=\"row\">\n      <div class=\"col-4\">\n        <div class=\"list-group\" id=\"list-tab-" + id + "\" role=\"tablist\">\n          <a class=\"list-group-item list-group-item-action active\" id=\"list-node-list-" + id + "\" data-toggle=\"list\" href=\"#list-node-" + id + "\" role=\"tab\" aria-controls=\"node\">Node</a>\n          <a class=\"list-group-item list-group-item-action\" id=\"list-behavior-list-" + id + "\" data-toggle=\"list\" href=\"#list-behavior-" + id + "\" role=\"tab\" aria-controls=\"behavior\">Transactions</a>\n          <a class=\"list-group-item list-group-item-action\" id=\"list-messages-list-" + id + "\" data-toggle=\"list\" href=\"#list-mine-" + id + "\" role=\"tab\" aria-controls=\"mine\">Mine</a>\n          <a class=\"list-group-item list-group-item-action\" id=\"list-messages-list-" + id + "\" data-toggle=\"list\" href=\"#list-messages-" + id + "\" role=\"tab\" aria-controls=\"messages\">Traffic</a>\n          <a class=\"list-group-item list-group-item-action\" id=\"list-settings-list-" + id + "\" data-toggle=\"list\" href=\"#list-settings-" + id + "\" role=\"tab\" aria-controls=\"settings\">Settings</a>\n        </div>\n      </div>\n      <div class=\"col-8\">\n        <div class=\"tab-content\" id=\"nav-tabContent-" + id + "\">\n          \n          <div class=\"tab-pane fade show active\" id=\"list-node-" + id + "\" role=\"tabpanel\" aria-labelledby=\"list-node-list-" + id + "\">\n            \n    \n           <div class=\"list-group\">\n    \n      <div href=\"#\" class=\"list-group-item list-group-item-action\">\n          <div class=\"d-flex w-100 justify-content-between\">\n            <h5 class=\"mb-1\">IP Address</h5>\n            \n          </div>\n          <p class=\"mb-1\"><input type=\"text\" class=\"form-control ip_input\" placeholder=\"Input public IP address\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n          <small class=\"text-muted\">The public IP address</small>\n        </div>\n    \n      <div href=\"#\" class=\"list-group-item list-group-item-action\">\n        <div class=\"d-flex w-100 justify-content-between\">\n          <h5 class=\"mb-1\">Information</h5>\n          \n        </div>\n        <p class=\"mb-1\">\n          NodeID: <span class=\"node_id_value\">Unknown</span>\n        </p>\n    \n        <p class=\"mb-1\">\n            Registered: <span class=\"node_if_registered\">Unknown</span>\n        </p>\n    \n        <p class=\"mb-1\">\n          Traffic Recorded: <span class=\"node_if_traffic_recorded\">Unknown</span>\n      </p>\n    \n    \n    \n        <small class=\"text-muted\">The identifier of this node</small>\n    </div>\n    \n    </div>\n    \n    <button id=\"connectBtn_" + id + "\" node_id=\"" + id + "\" style=\"margin-top:10px;\" type=\"button\" class=\"btn btn-primary btn-block connect_btn\">\n      Connect</button>\n            \n            \n            \n          </div>\n          <div class=\"tab-pane fade\" id=\"list-behavior-" + id + "\" role=\"tabpanel\" aria-labelledby=\"list-behavior-list\">\n            \n    \n           <div class=\"list-group\">\n    \n      <div href=\"#\" class=\"list-group-item list-group-item-action\">\n          <div class=\"d-flex w-100 justify-content-between\">\n            <h5 class=\"mb-1\">Action Route</h5>\n            <small>seconds</small>\n          </div>\n          <p class=\"mb-1 tx_route_wrapper\"><input class=\"form-control\" placeholder=\"Interval in seconds.0 means no transaction generated on this node.\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n        \n           <small class=\"text-muted\">The route to generate a new transaction</small>\n          </div>\n    \n      <div href=\"#\" class=\"list-group-item list-group-item-action\">\n        <div class=\"d-flex w-100 justify-content-between\">\n          <h5 class=\"mb-1\">Possion Average Interval</h5>\n          <small>seconds</small>\n        </div>\n        <p class=\"mb-1\"><input type=\"number\" class=\"form-control txGenerateInterval_input\" class=\"form-control\" placeholder=\"Interval in seconds.0 means no transaction generated on this node.\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n        <small class=\"text-muted\">The interval of transaction generated</small>\n      </div>\n      <!--\n      <div href=\"#\" class=\"list-group-item list-group-item-action\">\n        <div class=\"d-flex w-100 justify-content-between\">\n          <h5 class=\"mb-1\">Transaction Random Delay</h5>\n          <small>seconds</small>\n        </div>\n        <p class=\"mb-1\"><input type=\"number\" class=\"form-control txRandomDelay_input\" class=\"form-control\" placeholder=\"The range of random delay\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n        <small class=\"text-muted\">Transaction delay in random</small>\n      </div>\n      -->\n    </div>\n    \n            \n            \n            \n          </div>\n          <div class=\"tab-pane fade\" id=\"list-mine-" + id + "\" role=\"tabpanel\" aria-labelledby=\"list-mine-list-" + id + "\">\n              <div href=\"#\" class=\"list-group-item list-group-item-action\">\n                  <div class=\"d-flex w-100 justify-content-between\">\n                    <h5 class=\"mb-1\">Action Route</h5>\n                    <small>seconds</small>\n                  </div>\n                  <p class=\"mb-1 mining_route_wrapper\"><input class=\"form-control\" placeholder=\"Interval in seconds.0 means no transaction generated on this node.\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n                \n                   <small class=\"text-muted\">The interval of transaction generated</small>\n                  </div>\n          </div>\n          <div class=\"tab-pane fade\" id=\"list-messages-" + id + "\" role=\"tabpanel\" aria-labelledby=\"list-messages-list-" + id + "\">In Progress...</div>\n          <div class=\"tab-pane fade\" id=\"list-settings-" + id + "\" role=\"tabpanel\" aria-labelledby=\"list-settings-list-" + id + "\">\n            <div href=\"#\" class=\"list-group-item list-group-item-action\">\n              <div class=\"d-flex w-100 justify-content-between\">\n                <h5 class=\"mb-1\">Loaded Consensus</h5>\n               \n              </div>\n              <p class=\"mb-1 consensus_loaded_p\"><input type=\"text\" disabled class=\"form-control maxTranPerBlock_input\" class=\"form-control\" placeholder=\"connect to an active node to show consensus loaded\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n              <small class=\"text-muted\">import path:<span class=\"consensus_loaded_path\"></span></small>\n            </div>\n            \n            <div class=\"user_setting_content\"></div>\n    \n            <div class=\"save_conf_button_wrapper\">\n              <button style=\"margin-top:10px;\" type=\"button\" class=\"btn btn-primary btn-block\">Save</button>\n            </div>\n            \n    \n          </div>\n        </div>\n      </div>\n    </div>\n               \n               \n               \n               \n               \n               \n             </div>\n             \n             \n          </div>\n        </div>\n      </div>";
    return html;
}
//# sourceMappingURL=node_manager.js.map