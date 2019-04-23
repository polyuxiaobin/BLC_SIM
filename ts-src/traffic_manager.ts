import Connector from "./connector";
import Cloud from "./lean_cloud";

export class TrafficManager{
    public static downloadExperimentData(expID:string,cloud:Cloud) {
        let whereObj = {"experimentId":expID.trim()};
        cloud.lean_cloud_get("/classes/Requests",whereObj).done(function(resp:any){
            //let stringData = JSON.stringify(resp, null, 4);
            let resultWindow = window.open("", "Traffic Collected in Experiment");
            resultWindow.document.write(`<title>Traffic In ${expID}</title><div id='trafficDisplay'></div>`);
            let contentDiv = $('#trafficDisplay',resultWindow.document);
            let div = <any>(contentDiv);
            div.jsonViewer(resp,{collapsed: false,rootCollapsable:false});
        });
        
    }
};