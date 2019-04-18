import {lean_cloud_config} from './configurations';
export default class Cloud{
    
    appId = '';
    key = '';

    constructor(){
        this.appId = lean_cloud_config.appId;
        this.key = lean_cloud_config.key;
    }

    public set_attr(appId:string,key:string){
        this.appId = appId;
        this.key = key;
    }
    
    lean_cloud_get(route:string)
    {
        let request_url = 'https://' + this.appId.substr(0,8) +'.api.lncld.net/1.1' + route;
        let info = {
            type: 'GET',
            url: request_url,
            headers:{'X-LC-Id':this.appId,'X-LC-Key':this.key,"Content-Type":"text/plain;charset=UTF-8"}
            //xhrFields: {withCredentials: true}
        };
        let promise = $.ajax(info);
        return promise;
    }
    
    lean_cloud_post(route:string,data:any){
        let request_url = 'https://' + this.appId.substr(0,8) +'.api.lncld.net/1.1' + route;
        let info = {
            type: 'POST',
            url: request_url,
            headers:{'X-LC-Id':this.appId,'X-LC-Key':this.key,"Content-Type":"application/json;charset=UTF-8"},
            data:JSON.stringify(data),
            dataType: "json"
            //xhrFields: {withCredentials: true}
        };
        let promise = $.ajax(info);
        return promise;
    }
    
    lean_cloud_put(class_name:string,objectID:string,data:any){
        let route = class_name + "/" + objectID 
        let request_url = 'https://' + this.appId.substr(0,8) +'.api.lncld.net/1.1/classes/' + route;
        let info = {
            type: 'PUT',
            url: request_url,
            headers:{'X-LC-Id':this.appId,'X-LC-Key':this.key,"Content-Type":"application/json;charset=UTF-8"},
            data:JSON.stringify(data),
            dataType: "json"
            //xhrFields: {withCredentials: true}
        };
        let promise = $.ajax(info);
        return promise;
    }
     
     
    lean_cloud_delete(delete_class:string,delete_id:string,data:any){
        let request_url = 'https://' + this.appId.substr(0,8) +'.api.lncld.net/1.1/classes/' + delete_class + '/' + delete_id;
        let info = {
            type: 'DELETE',
            url: request_url,
            headers:{'X-LC-Id':this.appId,'X-LC-Key':this.key,"Content-Type":"application/json;charset=UTF-8"},
            dataType: "json"
            //xhrFields: {withCredentials: true}
        };
        let promise = $.ajax(info);
        return promise;
    } 
}
    