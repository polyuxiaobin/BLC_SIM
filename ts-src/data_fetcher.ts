import Connector from "./connector";
import Utils from "./utils";
import { setupLaunchBehaviors, setupAppConfSaveButton } from "./node_manager";


function getConsensusNameAndConfs(base_url:string,node_item_ID){
    let url = Utils.joinURL(base_url,'/app_conf');
    Connector.getResponse(url,null,resp=>{
        console.log("consensus",resp);
        let consensus_list = Object.keys(resp);
        let html = ``;
        $.each(consensus_list,(_,consensus_name)=>{
            //consensus_loaded_p
            let consensus = resp[consensus_name];
            let path = consensus['path'];
            let conf = consensus['conf'];
            console.log($(`#collapse_${node_item_ID}`).find('.consensus_loaded_p>input'));
            $(`#collapse_${node_item_ID}`).find('.consensus_loaded_p>input').val(consensus_name);
            $(`#collapse_${node_item_ID}`).find('.consensus_loaded_path').html(path);
            $.each(conf,(k,v)=>{
                html += generateHTMLForConfItem(k,v);
            });
        });
        //user_setting_content
        $(`#collapse_${node_item_ID}`).find('.user_setting_content').html(html);
    },resp=>{
        console.log("error in getting confs",resp);
    });

}

function getAvailableRoutes(base_url:string,node_item_ID,input_selector:string){
    let url = Utils.joinURL(base_url,'/site-map');
    Connector.getResponse(url,null,resp=>{
        let html = "";
        let route_list = [];
        $.each(resp,(index,value:string[])=>{
            let route = value[0];
            let method = value[1];
            route_list.push(route);
            //let htmlPiece = `<a class="dropdown-item" href="#">${route}</a>`;
            //html += htmlPiece;
        });
        let input;
        if (node_item_ID){
            input = $(`#collapse_${node_item_ID}`).find(input_selector);
        }
        else{
            input = $(input_selector);
        }
        let input_any:any = <any>($(input));
        input_any.autocomplete({source:route_list});
        let inspect_route_input = <any>($('#new_inspect_route_input'));
        inspect_route_input.autocomplete({source:route_list});
        

        let defaultTxRoute = '/sim/transaction';
        let defaultMineRoute = '/sim/mine';
        let route_list_any:any = <any>route_list;
        if(route_list_any.includes(defaultTxRoute)){
            $(`#collapse_${node_item_ID}`).find('.tx_route_wrapper>input').val(defaultTxRoute);
        }
        if(route_list_any.includes(defaultMineRoute)){
            $(`#collapse_${node_item_ID}`).find('.mining_route_wrapper>input').val(defaultMineRoute);
        }
        //mining_action_options
        //$(`#collapse_${node_item_ID}`).find('.mining_action_options').html(html);
    });
}


function generateHTMLForConfItem(key,value?){
    let type_declaration = `type="string"`;
    let type = "string";
    if (value){
        type = typeof(value);
        type_declaration = `type="${type}"`;
    }
    else{
        value = "";
    }
    let html = 
    `<div href="#" class="list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${key}</h5>
        </div>
        <p class="mb-1 app_conf_input_wrapper"><input ${type_declaration} value="${value}" param="${key}" class="form-control" class="form-control" placeholder="input a ${type}" aria-label="Username" aria-describedby="addon-wrapping"></p>
        <small class="text-muted">consensus user-provided configuration</small>
    </div>`;
    return html;
}

export function initNodeWithDefaults(base_url:string,node_item_ID){
    initBasicInfo(base_url,node_item_ID);
    getConsensusNameAndConfs(base_url,node_item_ID);

    getAvailableRoutes(base_url,node_item_ID,'.tx_route_wrapper>input');
    getAvailableRoutes(base_url,node_item_ID,'.mining_route_wrapper>input');
    setupLaunchBehaviors();
    setupAppConfSaveButton(base_url);
    //mining_route_wrapper
}


function initBasicInfo(base_url:string,node_item_ID){
    let url = Utils.joinURL(base_url,'/self');
    Connector.getResponse(url,null,resp=>{
        console.log("default success",resp);
        let registered = resp['registered'];
        let name = resp['name'];
        let traffic_enabled = resp['traffic_recorded'];
        let reg_button_class = `reg_button_${node_item_ID}`;
        $(`#collapse_${node_item_ID}`).find('.node_id_value').html(`<strong>${name}</strong>`);
        if(registered){
            let color = '#007bff';
            let html_inner = "yes";
            $(`#collapse_${node_item_ID}`).find('.node_if_registered').css('color',color);
            $(`#collapse_${node_item_ID}`).find('.node_if_registered').html(html_inner);
        }
        else{
            let html_inner = `<span style="color:gray">registering...</span>`
            let reg_btn =  `<span style="padding-left:5px;" class="${reg_button_class}">Register</span>`;
            let registrationURL = Utils.joinURL(base_url,'/register_myself');
            $(`#collapse_${node_item_ID}`).find('.node_if_registered').html(html_inner);
            Connector.getResponse(registrationURL,null,(resp)=>{
                if (resp.success){
                    let html_inner = "yes";
                    let color = '#007bff';
                    $(`#collapse_${node_item_ID}`).find('.node_if_registered').css('color',color);
                    $(`#collapse_${node_item_ID}`).find('.node_if_registered').html(html_inner);
                }
                else{
                    let html_inner = "no";
                    $(`#collapse_${node_item_ID}`).find('.node_if_registered').css('color','red');
                    $(`#collapse_${node_item_ID}`).find('.node_if_registered').html(html_inner+reg_btn);
                    console.log("auto-registration failed with message:",resp.message);
                }
            },(resp)=>{
                let html_inner = "no";
                $(`#collapse_${node_item_ID}`).find('.node_if_registered').css('color','red');
                $(`#collapse_${node_item_ID}`).find('.node_if_registered').html(html_inner+reg_btn);
                console.log("auto-registration failed due to network error:",resp);
            })
            
        }
        if(traffic_enabled){
            let color = '#007bff';
            $(`#collapse_${node_item_ID}`).find('.node_if_traffic_recorded').css('color',color);
            $(`#collapse_${node_item_ID}`).find('.node_if_traffic_recorded').html("yes");
        }
        else{
            $(`#collapse_${node_item_ID}`).find('.node_if_traffic_recorded').css('color','red');
            $(`#collapse_${node_item_ID}`).find('.node_if_traffic_recorded').html("no");
        }
            //node_if_traffic_recorded
    },resp=>{
        console.log("default fail",resp);
    });
}