"use strict";
exports.__esModule = true;
var connector_1 = require("./connector");
var utils_1 = require("./utils");
var node_manager_1 = require("./node_manager");
function getConsensusNameAndConfs(base_url, node_item_ID) {
    var url = utils_1["default"].joinURL(base_url, '/app_conf');
    connector_1["default"].getResponse(url, null, function (resp) {
        console.log("consensus", resp);
        var consensus_list = Object.keys(resp);
        var html = "";
        $.each(consensus_list, function (_, consensus_name) {
            //consensus_loaded_p
            var consensus = resp[consensus_name];
            var path = consensus['path'];
            var conf = consensus['conf'];
            console.log($("#collapse_" + node_item_ID).find('.consensus_loaded_p>input'));
            $("#collapse_" + node_item_ID).find('.consensus_loaded_p>input').val(consensus_name);
            $("#collapse_" + node_item_ID).find('.consensus_loaded_path').html(path);
            $.each(conf, function (k, v) {
                html += generateHTMLForConfItem(k, v);
            });
        });
        //user_setting_content
        $("#collapse_" + node_item_ID).find('.user_setting_content').html(html);
    }, function (resp) {
        console.log("error in getting confs", resp);
    });
}
function getAvailableRoutes(base_url, node_item_ID, input_selector) {
    var url = utils_1["default"].joinURL(base_url, '/site-map');
    connector_1["default"].getResponse(url, null, function (resp) {
        var html = "";
        var route_list = [];
        $.each(resp, function (index, value) {
            var route = value[0];
            var method = value[1];
            route_list.push(route);
            //let htmlPiece = `<a class="dropdown-item" href="#">${route}</a>`;
            //html += htmlPiece;
        });
        var input;
        if (node_item_ID) {
            input = $("#collapse_" + node_item_ID).find(input_selector);
        }
        else {
            input = $(input_selector);
        }
        var input_any = ($(input));
        input_any.autocomplete({ source: route_list });
        var inspect_route_input = ($('#new_inspect_route_input'));
        inspect_route_input.autocomplete({ source: route_list });
        var defaultTxRoute = '/sim/transaction';
        var defaultMineRoute = '/sim/mine';
        var route_list_any = route_list;
        if (route_list_any.includes(defaultTxRoute)) {
            $("#collapse_" + node_item_ID).find('.tx_route_wrapper>input').val(defaultTxRoute);
        }
        if (route_list_any.includes(defaultMineRoute)) {
            $("#collapse_" + node_item_ID).find('.mining_route_wrapper>input').val(defaultMineRoute);
        }
        //mining_action_options
        //$(`#collapse_${node_item_ID}`).find('.mining_action_options').html(html);
    });
}
function generateHTMLForConfItem(key, value) {
    var type_declaration = "type=\"string\"";
    var type = "string";
    if (value) {
        type = typeof (value);
        type_declaration = "type=\"" + type + "\"";
    }
    else {
        value = "";
    }
    var html = "<div href=\"#\" class=\"list-group-item list-group-item-action\">\n        <div class=\"d-flex w-100 justify-content-between\">\n        <h5 class=\"mb-1\">" + key + "</h5>\n        </div>\n        <p class=\"mb-1 app_conf_input_wrapper\"><input " + type_declaration + " value=\"" + value + "\" param=\"" + key + "\" class=\"form-control\" class=\"form-control\" placeholder=\"input a " + type + "\" aria-label=\"Username\" aria-describedby=\"addon-wrapping\"></p>\n        <small class=\"text-muted\">consensus user-provided configuration</small>\n    </div>";
    return html;
}
function initNodeWithDefaults(base_url, node_item_ID) {
    initBasicInfo(base_url, node_item_ID);
    getConsensusNameAndConfs(base_url, node_item_ID);
    getAvailableRoutes(base_url, node_item_ID, '.tx_route_wrapper>input');
    getAvailableRoutes(base_url, node_item_ID, '.mining_route_wrapper>input');
    node_manager_1.setupLaunchBehaviors();
    node_manager_1.setupAppConfSaveButton(base_url);
    //mining_route_wrapper
}
exports.initNodeWithDefaults = initNodeWithDefaults;
function initBasicInfo(base_url, node_item_ID) {
    var url = utils_1["default"].joinURL(base_url, '/self');
    connector_1["default"].getResponse(url, null, function (resp) {
        console.log("default success", resp);
        var registered = resp['registered'];
        var name = resp['name'];
        var traffic_enabled = resp['traffic_recorded'];
        var reg_button_class = "reg_button_" + node_item_ID;
        $("#collapse_" + node_item_ID).find('.node_id_value').html("<strong>" + name + "</strong>");
        if (registered) {
            var color = '#007bff';
            var html_inner = "yes";
            $("#collapse_" + node_item_ID).find('.node_if_registered').css('color', color);
            $("#collapse_" + node_item_ID).find('.node_if_registered').html(html_inner);
        }
        else {
            var html_inner = "<span style=\"color:gray\">registering...</span>";
            var reg_btn_1 = "<span style=\"padding-left:5px;\" class=\"" + reg_button_class + "\">Register</span>";
            var registrationURL = utils_1["default"].joinURL(base_url, '/register_myself');
            $("#collapse_" + node_item_ID).find('.node_if_registered').html(html_inner);
            connector_1["default"].getResponse(registrationURL, null, function (resp) {
                if (resp.success) {
                    var html_inner_1 = "yes";
                    var color = '#007bff';
                    $("#collapse_" + node_item_ID).find('.node_if_registered').css('color', color);
                    $("#collapse_" + node_item_ID).find('.node_if_registered').html(html_inner_1);
                }
                else {
                    var html_inner_2 = "no";
                    $("#collapse_" + node_item_ID).find('.node_if_registered').css('color', 'red');
                    $("#collapse_" + node_item_ID).find('.node_if_registered').html(html_inner_2 + reg_btn_1);
                    console.log("auto-registration failed with message:", resp.message);
                }
            }, function (resp) {
                var html_inner = "no";
                $("#collapse_" + node_item_ID).find('.node_if_registered').css('color', 'red');
                $("#collapse_" + node_item_ID).find('.node_if_registered').html(html_inner + reg_btn_1);
                console.log("auto-registration failed due to network error:", resp);
            });
        }
        if (traffic_enabled) {
            var color = '#007bff';
            $("#collapse_" + node_item_ID).find('.node_if_traffic_recorded').css('color', color);
            $("#collapse_" + node_item_ID).find('.node_if_traffic_recorded').html("yes");
        }
        else {
            $("#collapse_" + node_item_ID).find('.node_if_traffic_recorded').css('color', 'red');
            $("#collapse_" + node_item_ID).find('.node_if_traffic_recorded').html("no");
        }
        //node_if_traffic_recorded
    }, function (resp) {
        console.log("default fail", resp);
    });
}
//# sourceMappingURL=data_fetcher.js.map