import { addNewNode, addNewInspectionPrompt } from "./node_manager";

export function setupTopButtons(){
    $('#startAllBtn').on('click',(event)=>{
        console.log('start all nodes');

    });
    $('#addNewNodeBtn').on('click',(event)=>{
        console.log('add new node');
        addNewNode();
    });
    $('#loadConfBtn').on('click',(event)=>{
        console.log('load conf');
    });
    $('#saveConfBtn').on('click',(event)=>{
        console.log('save conf');
    });
    $('#new_inspect_btn').on('click',(event)=>{
        console.log('save conf');
        addNewInspectionPrompt();
    });
}