export default class Utils{
    public static convertToURL(ip:string){
        if ((<any>ip).startsWith('https://')){
            return ip;
        }
        if ((<any>ip).startsWith('http://')){
            return ip;
        }
        return "http://"+ip
    }
    
    public static showTip(title:string,content:string,type:string,shownTime?:number){
        $('#information-tip').html("");
        $('#information-tip').show();
        let alertType = 'alert-' + type;

        let html = 
        `<div class="alert ${alertType} alert-dismissible fade show" role="alert">
        <strong>${title}</strong> ${content}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>`;
        
        $('#information-tip').html(html);
        
        
        if (shownTime){
            $('#information-tip').fadeOut(shownTime*1000);
        }
        
    }
    public static getJSONPName(){
        let today = new Date();
        let stamp = `resp_${today.getFullYear()}_${today.getMonth()}_${today.getDay()}_${today.getHours()}_${today.getMinutes()}_${today.getMilliseconds()}`;
        return stamp;
    }
    public static joinURL(base:string,route:string){
        base = base.trim();
        route = route.trim();
        let pos0 = (<any>(base)).endsWith("/");
        let pos1 = (<any>(route)).startsWith("/");
        if(pos0){
            base = base.substr(0,base.length-1);
        }
        if(pos1){
            route = route.substr(1);
        }
        return `${base.trim()}/${route.trim()}`;
    }

    public static getRandomInt(max:number):number {
        return Math.floor(Math.random() * Math.floor(max));
      }
}