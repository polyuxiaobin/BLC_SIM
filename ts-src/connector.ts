import Utils from "./utils";

export default class Connector{
    
    public static checkAlive(ip:string,port?:number,done?:Function,fail?:Function){
        let url_string:string;
        if (port)
            url_string = ip + ":" + port;
        else
            url_string = ip;
        $.ajax({url:url_string})
        .done(function(resp:any){
            console.log("success",resp);
            if(done)
                done(resp);
        })
        .fail(function(resp:any){
            console.log(`failed:${ip}`,resp);
            if (fail)
                fail(resp);
        })
    }

    public static getResponse(url:string,data,done?:Function,fail?:Function){
        let jsonp_name = Utils.getJSONPName();
        let params = {};
        if(data){
            params = data;
        }
        params['jsonp'] = jsonp_name;
        if((<any>url).startsWith('https://') || (<any>url).startsWith('http://')){
            $.ajax(
                {
                    url:url,
                    jsonp:'jsonp',
                    dataType: 'jsonp',
                    jsonpCallback:jsonp_name,
                    data:params
                }
            )
            .done(resp=>{
                if (done){
                    done(resp);
                }
            })
            .fail(resp=>{
                if (fail){
                    fail(resp);
                }
            });
        }
        else{
            console.log("http or https should be used.");
        }
    }
    
}