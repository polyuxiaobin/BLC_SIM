import Cloud from './lean_cloud';
import Storage from './storage';
import global_states from './states';
import Connector from './connector';
import NodeController from './node_controller';
import Utils from './utils';
import { initNodeWithDefaults } from './data_fetcher';
import { generateNodes } from './node_manager';
import { setupTopButtons } from './top_button_controller';

let cloud = new Cloud();
let globalUser:string;

function init_app(){
    $('#new_exp_id_create').hide();
    setupTopButtons();
    cloud.lean_cloud_get("/classes/Experiments").done(function(resp:any){
        //console.log('resp',resp);
        let expList = resp['results'];
        let options_html = "";
        //expList = expList.reverse();
        $.each(expList,function(_,exp){
            let id = exp['ID'];
            let comment = exp['comment'];
            let user = exp['user'];
            console.log(id,comment,user);
            let html = `<option class="display_experiment_comments" comment="${comment}" user="${user}" style="padding:5px;">${id} </option>`
            options_html = html + options_html;
            
        })
        
        $('#experimentIDModalSelect').html(options_html);
        
        $('.display_experiment_comments').on('click',function(obj:any){
            //console.log('display_experiment_comments',obj.target);
            display_experiment_comments(obj.target); 
        });
        
        
        $('#experimentIDModal').modal('show');
        console.log('app init');
    });
}



function display_experiment_comments(obj:any){
    let comment = $(obj).attr('comment');
    let user_in_exp = $(obj).attr('user');
    globalUser = user_in_exp;
    let id = $(obj).html()

    if (comment && comment != 'undefined')
        $('#expIdDescription').html(comment+ `\nby ${user_in_exp}`);
    else
        $('#expIdDescription').html('No description given for '+id + `\nby ${user_in_exp}`);
}

function go_to_current_exp_view(obj:any){
    $('.expid_link').removeClass('active');
    $(obj).addClass('active');
    $('#new_exp_id_create').hide();
    $('#choose_exp_id').fadeIn();
}

function go_to_create_exp_view(obj:any){
    $('.expid_link').removeClass('active');
    $(obj).addClass('active');
    $('#choose_exp_id').hide();
    $('#new_exp_id_create').fadeIn();
}

function start_new_experiment(obj:any){
    
    if($('#new_exp_id_create').is(":visible"))
        {
        //check if the fields are filled
        let id:string = (<string>($('#experimentIDInput').val())).trim();
        let user:string = (<string>$('#user_name_input').val()).trim();
        let comment:string = (<string>$('#desc_input').val()).trim();
        if(id.length >0 && user.length >0 && comment.length >0){
            let storage = new Storage();
            storage.addNewExperiment(id,user,comment).done(function(resp){
            console.log("new experiment added",resp);
            $('#expIDShow').html(id);
            $('#userShow').html(user);
            $('#experimentIDModal').modal('hide');
            global_states['expID'] = id;
        });
        }
        else{
            console.log("some fields are empty");
        }
    }
    else if($('#choose_exp_id').is(":visible")){
        let choice = $('#experimentIDModalSelect').find(":selected");
        if(choice.length == 0){
            console.log("must choose one");
            return;
        }
        let id = choice.text();
        global_states['expID'] = id;
        console.log('choose',choice.text());
        $('#expIDShow').html(id);
        $('#userShow').html(globalUser);
        $('#experimentIDModal').modal('hide');
    }
}

$('#go_to_create_exp_view_btn').on('click',function(obj:any){
    go_to_create_exp_view(obj);
});

$('#go_to_current_exp_view_btn').on('click',function(obj:any){
    go_to_current_exp_view(obj);
});

$('#newExperientBtn').on('click',function(obj:any){
    start_new_experiment(obj);
});

/*
    quick buttons
*/



function setupConnectionBtn(){
    $('.connect_btn').off('click');
    $('.connect_btn').on('click',function(obj:any){
        console.log("connect button pressed",obj.target);
        let button = $(obj.target);
        let collaspe_id = $(button).attr('node_id');
        let node_item = $("#collapse_"+collaspe_id);
        if (button.html().trim() == 'Disconnect'){
            node_item.find('.ip_input').removeAttr('disabled');
            button.removeClass("btn-outline-primary");
            button.addClass("btn-primary");
            button.html("Connect");
            node_item.parent().find('.launchBtn').attr('disabled','disabled');
            button.closest('.card').find('.node-toggle-btn').css('color','gray');
            return;
        }
        
        console.log("node=",node_item);
        let ip_entered:string = <string>node_item.find('.ip_input').val();
        let url = ip_entered.trim();
        if (!url){
            console.log('no url provided');
            node_item.parent().find('.launchBtn').attr('disabled','disabled');
            button.closest('.card').find('.node-toggle-btn').css('color','gray');
            return;
        }
        url = Utils.convertToURL(url);
        console.log("url",url);
        let onSuccess = (resp:any)=>{
            button.addClass("btn-outline-primary");
            button.removeClass("btn-primary");
            button.html("Disconnect");
            if(!global_states.hasOwnProperty('NodeControllers')){
                global_states['NodeControllers'] = new Array<NodeController>();
            }
            let nodeControllerList = <NodeController[]>global_states['NodeControllers'];
            //let url = Utils.convertToURL(ip,portNum);
            //let url = ip_entered.trim();
            let nodeController = new NodeController(url.trim());
            //[i] = (nodeController);
            node_item.find('.ip_input').attr('disabled','disabled');
            console.log('nodeControllerList',nodeControllerList);
            initNodeWithDefaults(url,collaspe_id);
            node_item.parent().find('.launchBtn').removeAttr('disabled');
            button.closest('.card').find('.node-toggle-btn').css('color','black');
            Utils.showTip("Connected","This node is connected successfully.","primary",3);
        };
        let onFailure = (resp:any)=>{
            node_item.find('.ip_input').removeAttr('disabled');
            button.removeClass("btn-outline-primary");
            button.addClass("btn-primary");
            button.html("Connect");
            button.closest('.card').find('.node-toggle-btn').css('color','gray');
            Utils.showTip("DisConnected","This node cannot be connected.","danger",5);
        };
        Connector.checkAlive(url,null,onSuccess,onFailure);
    });
}

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
for(let i:number=0;i<5;i++){
    let buttonName = '#saveConfigBtn_' + i;
    let button = $(buttonName);
    button.on('click',function(obj:any){
        let btnParent = button.parent();
        let txGenerateInterval:string = <string>(btnParent.find('.txGenerateInterval_input').val());
        let txRandomDelay:string = <string>(btnParent.find('.txRandomDelay_input').val());
        let maxTranPerBlock:string = <string>(btnParent.find('.maxTranPerBlock_input').val());
        let txGenerateIntervalNum = null;
        let txRandomDelayNum = null;
        let maxTranPerBlockNum = null;
        
        if (txGenerateInterval.trim() != ''){
            txGenerateIntervalNum = parseFloat(txGenerateInterval);
        }
        if (txRandomDelay.trim() != ''){
            txRandomDelayNum = parseFloat(txRandomDelay);
        }
        if (maxTranPerBlock.trim() != ''){
            maxTranPerBlockNum = parseInt(maxTranPerBlock);
        }

        if(!global_states.hasOwnProperty('NodeControllers')){
            Utils.showTip("Error","No node is connected","danger",5);
            throw new Error("No node is connected");
            return;
        }
        let nodeControllerList = <NodeController[]>global_states['NodeControllers'];
        let nodeController = nodeControllerList[i];
        if(!nodeController.valid){
            Utils.showTip("Error","this node is invalid! Make sure it's connected.","danger",5);
            throw new Error("this node is invalid! Make sure it's connected.");
            return;
        }
        nodeController.configure(txGenerateIntervalNum,txRandomDelayNum,maxTranPerBlockNum);
        console.log("nodeController("+i+") is configured.",nodeController);
        Utils.showTip("Saved","Configuration saved","primary",3);
        
    });
}

//start op button
for(let i:number=0;i<5;i++){
    let buttonName = '#startOpBtn_' + i;
    let button = $(buttonName);
    
    button.on('click',function(obj:any){
        let nodeControllerList = <NodeController[]>global_states['NodeControllers'];
        let nodeController = nodeControllerList[i];
        if(!nodeController.valid){
            Utils.showTip("Error","this node is invalid! Make sure it's connected.","danger",5);
            throw new Error("this node is invalid! Make sure it's connected.");
            return;
        }
        nodeController.start();
    });
}



$('document').ready(()=>{
    init_app();
    generateNodes(5);
    setupConnectionBtn();
})
