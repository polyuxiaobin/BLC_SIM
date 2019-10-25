import Utils from "./utils";
import { MiningInstance } from "./mine_controller";
import { TransactionInstance } from "./transaction_controller";
import Connector from "./connector";
import global_states from "./states";

let miningInstanceMap: {[id:string]:MiningInstance} = {};
let transactionInstanceMap: {[id:string]:TransactionInstance} = {};


export function setupAppConfSaveButton(base_url:string){
    //update_conf
    $('.save_conf_button_wrapper>button').on('click',(event)=>{
        let button = <any>(event.target);
        //app_conf_input_wrapper
        let user_setting_content = $(button).parent().parent().find('.user_setting_content');
        let inputs = user_setting_content.find('.app_conf_input_wrapper>input');
        let consensus:string = <string>$(button).parent().parent().find('.consensus_loaded_p>input').val();
        let updated_values = {};
        $.each(inputs,(_,input)=>{
            console.log("input",input);
            let type = $(input).attr("type");
            let param = $(input).attr("param");
            let value = <any>$(input).val();
            value = value.trim(); 
            if(value){
                if (type == "number"){
                    let intValue = parseInt(value);
                    let floatValue = parseFloat(value);
                    if (intValue == floatValue){
                        value = intValue;
                    }
                    else{
                        value = floatValue;
                    }
                }
                updated_values[param] = value;
            }
        });
        console.log("updated=",updated_values,"consensus=",consensus);
        let data = {
            "data":JSON.stringify(updated_values),
            "consensus":consensus.toLowerCase()};
        let url = Utils.joinURL(base_url,"/update_conf");
        Connector.getResponse(url,data,(resp)=>{
            console.log("update_conf",resp);
            if(resp.success)
                Utils.showTip("Configuration Updated",`Configuration for consensus ${consensus} is now updated`,'primary',3);
            else
                Utils.showTip("Configuration Updation Failed",resp['message'],'danger',3);
        },(resp)=>{
            console.log("error in update_conf",resp);
            Utils.showTip("Configuration Updation Failed","Error in connection",'danger',3);
        });
    });
}




export function setupLaunchBehaviors(){
    $('.launchBtn').off('click');
    $('.launchBtn').on('click',(event)=>{
        let button = <any>(event.target);
        //console.log
        let isRunning = $(button).attr('running');
        let node_order = parseInt($(button).attr('node_order'));
        let selector = $(button).parent().find('.btn.btn-link').attr('data-target');
        let div = $(selector);
        let ip = div.find('.ip_input').val();
        let txRoute = div.find('.tx_route_wrapper>input').val();
        let txGenerateInterval = div.find('.txGenerateInterval_input').val();
        //let txRandomDelay = div.find('.txRandomDelay_input').val();
        let mineRoute = div.find('.mining_route_wrapper>input').val();
        let node_name = div.find('.node_id_value').val();
        if(!txGenerateInterval){
            txGenerateInterval = 10;
        }
        else{
            txGenerateInterval = parseFloat(<string>txGenerateInterval);
        }
        /*
        if(!txRandomDelay){
            txRandomDelay = 0;
        }
        else{
            txRandomDelay = parseFloat(<string>txRandomDelay);
        }
        */
        console.log(ip,txRoute,txGenerateInterval,mineRoute);
        if(!(ip || mineRoute)){
            Utils.showTip('Information Missing','Please make sure Action Route in mine is not empty.','danger',4);
            return;
        }
        let url = Utils.convertToURL(<string>ip);
        let miningURL = null;
        if (mineRoute)
            miningURL = Utils.joinURL(url,<string>mineRoute);
        let txURL = Utils.joinURL(url,<string>txRoute);
        let mineInstance:MiningInstance = miningInstanceMap[selector];
        let txInstance:TransactionInstance = transactionInstanceMap[selector];
        let stopOnError = true;
        let txString = `${txURL}-${txGenerateInterval}-${0}-${stopOnError}`;
        let mineString = `${miningURL}-${stopOnError}`;
        let txStopOnError:boolean = false;
        let mineStopOnError:boolean = false;
        if (isRunning.trim() == "true"){
            $(button).attr('running','false');
            setButtonState(button,false,div);
            
            if (!mineInstance){
                $(button).attr('running','false');
                return;
            }
            mineInstance.stopMining();
            
            if (!txInstance){
                $(button).attr('running','false');
                return;
            }
            txInstance.stopGenerateTransaction();
        }
        else{
            //miningInstanceList
            $(button).attr('running','true');
            setButtonState(button,true,div)
            if(!mineInstance || mineInstance.toString() != mineString){
                miningInstanceMap[selector] = new MiningInstance(miningURL,mineStopOnError,node_name,node_order);
                mineInstance = miningInstanceMap[selector];
            }
            if(!txInstance || txInstance.toString() != txString){
                transactionInstanceMap[selector] = new TransactionInstance(txURL,10,0,txStopOnError,node_name,node_order);
                txInstance = transactionInstanceMap[selector];
            }
            
            mineInstance.startMining();
            txInstance.startGenerateTransaction();
        }
        console.log("min_map=",miningInstanceMap);
        console.log("tx_map=",transactionInstanceMap);
        
    });
}



export function setCloseBtnBehavior(){
    $('.closeBtn').off('click');
    $('.closeBtn').on('click',(event)=>{
        let button = <any>(event.target);
        
        let running = $(button).closest('.mb-0').find('.launchBtn').attr('running').trim();
        console.log("isRunning=",running);
        if(running == "true"){
            //not allowed
            Utils.showTip("Deletion Forbidden","It's not allowed to delete a running node","danger",5);
            return;
        }
        else{
            $(button).find('.btn.btn-link').attr('data-target');
            let node_num = $(button).closest('.closeBtn').attr('node_order');
            let selector = `#collapse_${node_num}`;
            delete(miningInstanceMap[selector]);
            delete(transactionInstanceMap[selector]);
            console.log("min_map=",miningInstanceMap);
            console.log("tx_map=",transactionInstanceMap);
            Utils.showTip("Deleted",`Node ${node_num} is deleted`,"primary",3);
            let card = $(button).closest('.card');
            card.fadeOut("slow","linear",()=>{
                card.remove();
            });
        }
    });
}



function setButtonState(button:HTMLButtonElement,isRunning:boolean,div){
    if (isRunning){
        let html = 
        `<span style="margin-right:5px;">
            <div class="spinner-border spinner-border-sm" role="status">
            <span class="sr-only">Loading...</span>
          </div></span>Stop`;
        $(button).html(html);
        div.find('.ip_input').attr('disabled','disabled');
        div.find('.tx_route_wrapper>input').attr('disabled','disabled');
        div.find('.txGenerateInterval_input').attr('disabled','disabled');
        div.find('.txRandomDelay_input').attr('disabled','disabled');
        div.find('.mining_route_wrapper>input').attr('disabled','disabled');
        div.find('.connect_btn').attr('disabled','disabled');
        div.find('.app_conf_input_wrapper>input').attr('disabled','disabled');
        div.find('.save_conf_button_wrapper>button').attr('disabled','disabled');
        return;
    }
    else{
        let html = 
        `<span style="margin-right:5px;">
            <i class="fas fa-play"></i>  
        </span>Start`;
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

export function addNewNode(){
    let buttons = $('#generated').find('.launchBtn');
    let node_orders:number[] = [];
    $.each(buttons,(_,button)=>{
        let node_order = parseInt($(button).attr('node_order'));
        node_orders.push(node_order);
    });
    let startNum = Math.max(...node_orders)+1;
    generateNodes(1,startNum,true,true);
}

export function generateNodes(num:number,from:number=1,append:boolean=false,animated=false){
    let html = "";
    let originalNodeNumber = 0;
    for(let i=from;i < from + num; i++){
        if(animated)
            html +=generateTemplateForNode(i,false);
        else
            html +=generateTemplateForNode(i);
    }
    if(append){
        //let origin = $('#generated').html();
        originalNodeNumber = $('#generated').find('.card').length;
        $('#generated').append(html);
    }
    else{
        $('#generated').html(html);
    }
    if (animated){
        let nodes = $('#generated').find('.card');
        let currentLength = nodes.length;
        nodes.removeClass("d-none");
        for(let i=originalNodeNumber; i<currentLength;i++){
            //added.push(nodes[i]);
            $(nodes[i]).hide();
        }
        //let added = [];
        for(let i=originalNodeNumber; i<currentLength;i++){
            //added.push(nodes[i]);
            $(nodes[i]).fadeIn('slow');
        }
    }
    else{
        
    }
    $('.node_collapse').collapse("hide");
    let input_any:any = <any>($('.ip_input'));
    let route_list = [];
    for (let i=8081;i<=8100;i++){
        route_list.push(`127.0.0.1:${i}`);
    }
    input_any.autocomplete({source:route_list});
    setCloseBtnBehavior();
}


export function addNewInspectionPrompt(){
    $('#new_inspection_window').modal("show");
    try {
        let route_input = <any>($('#new_inspect_route_input'));
        route_input.autocomplete( "option", "appendTo", ".eventInsForm" );
    } catch (error) {
        
    }
    $('#new_inspect_add_btn').off('click');
    let detectInput = () =>{
        let name =  $('#new_inspect_name_input').val().toString().trim();
        let route = $('#new_inspect_route_input').val().toString().trim();
        if(name && route && (<any>route).startsWith('/')){
            $('#new_inspect_add_btn').removeAttr('disabled');
        }
        else{
            $('#new_inspect_add_btn').attr('disabled','disabled');
        }
    };
    $('#new_inspect_name_input').on('input',function(e){
        detectInput();
    });
    $('#new_inspect_route_input').on('input',function(e){
        detectInput();
    });
    $('#new_inspect_add_btn').off('click');
    $('#new_inspect_add_btn').on('click',(event)=>{
        let name =  $('#new_inspect_name_input').val().toString().trim();
        let route = $('#new_inspect_route_input').val().toString().trim();
        console.log(name,route);
        addNewInspect(name,route);
        let custom_key = 'custom_inspects';
        if (!(custom_key in Object.keys(global_states))){
            global_states['custom_inspects'] = {};
        }
        global_states['custom_inspects'][name] = route;
        
        $('#new_inspection_window').modal('hide');
        setupCustomInspectionEvents();
    });
}

export function setupCustomInspectionEvents(){
    $('.custom_inspect_menu_item').off('click');
    $('.custom_inspect_menu_item').on('click',(event)=>{
        let item = $(event.target);
        let href = item.attr('href');
        let itemContentDiv = $(href);
        let name = item.attr('name');
        let route = item.attr('route');
        let id = item.attr('nodeOrder');
        let ip = <string>$(`#collapse_${id}`).find('.ip_input').val();
        let base = Utils.convertToURL(ip);
        let routeURL = Utils.joinURL(base,route);
        
        itemContentDiv.html("Reloading...");
        Connector.getResponse(routeURL,null,(resp)=>{
            //console.log('resp=',resp);
            let div = <any>(itemContentDiv);
            div.jsonViewer(resp,{collapsed: true,rootCollapsable:false});
        },(error)=>{
            //console.log("error=",error);
            let innerHTML = generateInspectContent(name,routeURL);
            itemContentDiv.html(innerHTML);
        });
        
    });
}

function generateInspectContent(name,route){

    return `<div>${name} -- ${route}</div>`;
}


function addNewInspect(name:string,route:string){
    
    let inspection_windows = $('.custom_inspection');
    $.each(inspection_windows,(index,inspection_div)=>{
        let list_group_id = $(inspection_div).closest('.list-group').attr('id');
        let id = list_group_id.replace('list-tab-','');
        let menuItem = `<a class="list-group-item list-group-item-action custom_inspect_menu_item" name="${name}"  route="${route}" nodeOrder="${id}"  data-toggle="list" href="#list-custom_${name}_${id}" role="tab" aria-controls="addinspect_${name}_${id}"><i class="fas fa-sync-alt" style="padding-right:5px;"></i>${name}</a>`;
        //let group_list = $(`#list-group_content_${id}`);
        let ip = $(`#collapse_${id}`).find('.ip_input').val();
        //let inspectContent = generateInspectContent(ip);
        let menuItemContent = `<div class="tab-pane fade" id="list-custom_${name}_${id}" role="tabpanel" aria-labelledby="list-addinspect-list-${id}">Loading...</div>`;
        //group_list.append(menuItemContent);
        
        $(`#list-add-anchor-${id}`).parent().append(menuItemContent);
        $(`#${list_group_id}`).append(menuItem);
    });
}


function generateTemplateForNode(id:number,visible=true){
    let d_none = "";
    if(!visible){
        d_none = "d-none";
    }
    let html = 
    `
    <div class="card ${d_none}">
        <div class="card-header" id="heading${id}">
          <h2 class="mb-0" style="display: flex;
          justify-content: space-between;">
          <div>
            <button class="btn btn-link node-toggle-btn" style="color:gray" type="button" data-toggle="collapse" data-target="#collapse_${id}" aria-expanded="true" aria-controls="collapse_${id}">
              <i class="fas fa-server icon-right-margin"></i>Node ${id} 
            </button>
    
            <button class="btn btn-secondary btn-sm launchBtn" disabled type="button" running="false" node_order="${id}">
                  <span style="margin-right:5px;">
                      <i class="fas fa-play"></i>  
                  </span>Start
              </button>
           </div>
           <div>
                    <button class="btn btn-link btn-sm closeBtn" type="button" running="false" node_order="${id}" style="color:black;">
                    <span style="margin-right:5px;">
                        <i class="fas fa-times"></i> 
                    </span>
                </button>
           </div> 
          </h2>
        </div>
    
        <div id="collapse_${id}" class="node_collapse collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
          <div class="card-body">
             
             <div class="node_details">
               <div class="row">
      <div class="col-4">
        <div class="list-group" id="list-tab-${id}" role="tablist">
          <a class="list-group-item list-group-item-action active" id="list-node-list-${id}" data-toggle="list" href="#list-node-${id}" role="tab" aria-controls="node">Node</a>
          <a class="list-group-item list-group-item-action" id="list-behavior-list-${id}" data-toggle="list" href="#list-behavior-${id}" role="tab" aria-controls="behavior">Transactions</a>
          <a class="list-group-item list-group-item-action" id="list-mining-list-${id}" data-toggle="list" href="#list-mine-${id}" role="tab" aria-controls="mine">Mine</a>
          <a class="list-group-item list-group-item-action" id="list-messages-list-${id}" data-toggle="list" href="#list-messages-${id}" role="tab" aria-controls="messages">Traffic</a>
          <a class="list-group-item list-group-item-action" id="list-settings-list-${id}" data-toggle="list" href="#list-settings-${id}" role="tab" aria-controls="settings">Settings</a>
          <div class="custom_inspection" id="custom_inspection_${id}"></div>
          
        </div>
      </div>
      <div class="col-8">
        <div class="tab-content" id="nav-tabContent-${id}">
          
          <div class="tab-pane fade show active" id="list-node-${id}" role="tabpanel" aria-labelledby="list-node-list-${id}">
            
    
           <div class="list-group">
    
      <div href="#" class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">IP Address</h5>
            
          </div>
          <p class="mb-1"><input type="text" class="form-control ip_input" placeholder="Input public IP address" aria-label="Username" aria-describedby="addon-wrapping"></p>
          <small class="text-muted">The public IP address</small>
        </div>
    
      <div href="#" class="list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">Information</h5>
          
        </div>
        <p class="mb-1">
          NodeID: <span class="node_id_value">Unknown</span>
        </p>
    
        <p class="mb-1">
            Registered: <span class="node_if_registered">Unknown</span>
        </p>
    
        <p class="mb-1">
          Traffic Recorded: <span class="node_if_traffic_recorded">Unknown</span>
      </p>
    
    
    
        <small class="text-muted">The identifier of this node</small>
    </div>
    
    </div>
    
    <button id="connectBtn_${id}" node_id="${id}" style="margin-top:10px;" type="button" class="btn btn-primary btn-block connect_btn">
      Connect</button>
            
            
            
          </div>
          <div class="tab-pane fade" id="list-behavior-${id}" role="tabpanel" aria-labelledby="list-behavior-list">
            
    
           <div class="list-group" id="list-group_content_${id}">
    
      <div href="#" class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">Action Route</h5>
            <small>seconds</small>
          </div>
          <p class="mb-1 tx_route_wrapper"><input class="form-control" placeholder="Interval in seconds.0 means no transaction generated on this node." aria-label="Username" aria-describedby="addon-wrapping"></p>
        
           <small class="text-muted">The route to generate a new transaction</small>
          </div>
    
      <div href="#" class="list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">Possion Average Interval</h5>
          <small>seconds</small>
        </div>
        <p class="mb-1"><input type="number" class="form-control txGenerateInterval_input" class="form-control" placeholder="Interval in seconds.0 means no transaction generated on this node." aria-label="Username" aria-describedby="addon-wrapping"></p>
        <small class="text-muted">The interval of transaction generated</small>
      </div>
      <!--
      <div href="#" class="list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">Transaction Random Delay</h5>
          <small>seconds</small>
        </div>
        <p class="mb-1"><input type="number" class="form-control txRandomDelay_input" class="form-control" placeholder="The range of random delay" aria-label="Username" aria-describedby="addon-wrapping"></p>
        <small class="text-muted">Transaction delay in random</small>
      </div>
      -->
    </div>
    
            
            
            
          </div>
          <div class="tab-pane fade" id="list-mine-${id}" role="tabpanel" aria-labelledby="list-mine-list-${id}">
              <div href="#" class="list-group-item list-group-item-action">
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Action Route</h5>
                    <small>seconds</small>
                  </div>
                  <p class="mb-1 mining_route_wrapper"><input class="form-control" placeholder="Interval in seconds.0 means no transaction generated on this node." aria-label="Username" aria-describedby="addon-wrapping"></p>
                
                   <small class="text-muted">The interval of transaction generated</small>
                  </div>
          </div>
          <div class="tab-pane fade" id="list-messages-${id}" role="tabpanel" aria-labelledby="list-messages-list-${id}">In Progress...</div>
          <div class="tab-pane fade" id="list-settings-${id}" role="tabpanel" aria-labelledby="list-settings-list-${id}">
            <div href="#" class="list-group-item list-group-item-action">
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">Loaded Consensus</h5>
               
              </div>
              <p class="mb-1 consensus_loaded_p"><input type="text" disabled class="form-control maxTranPerBlock_input" class="form-control" placeholder="connect to an active node to show consensus loaded" aria-label="Username" aria-describedby="addon-wrapping"></p>
              <small class="text-muted">import path:<span class="consensus_loaded_path"></span></small>
            </div>
            
            <div class="user_setting_content"></div>
    
            <div class="save_conf_button_wrapper">
              <button style="margin-top:10px;" type="button" class="btn btn-primary btn-block">Save</button>
            </div>
            
    
          </div>

          
          
          <div id="list-add-anchor-${id}"></div>
          
        </div>
      </div>
    </div>
               
               
               
               
               
               
             </div>
             
             
          </div>
        </div>
      </div>`;

    return html;
}
