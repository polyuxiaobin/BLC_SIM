import Connector from "./connector";
import Utils from "./utils";


export class TransactionInstance{
    private interval_handler;
    private label:string;

    public constructor(private url:string,private avgSec:number,private stdSec:number,private stopOnError=true,private name,private id){
        if (name && id)
            this.label = `[${id}]${name}`;
        else if (id)
            this.label = `[${id}]`;
    }

    public startGenerateTransaction(){
        let url = this.url;
        let avgSec = this.avgSec;
        //let stdSec = this.stdSec;
        let stopOnError = this.stopOnError;
        let startTime:number;
        let possionDelay = Utils.possionNumberGenerator(avgSec);
        startTime = possionDelay*1000;
        if (avgSec == 0){
            return;
        }
        /*
        if (stdSec == 0)
        {
            startTime = avgSec*1000;
        }
        else{
            startTime = avgSec*1000 + Utils.getRandomInt(stdSec*1000);
        }
        */
        this.interval_handler = setInterval(()=>{
            Connector.getResponse(url,null,(resp)=>{
                console.log(`${this.label} transaction result=`,resp);
                /*
                if (stdSec == 0)
                {
                    startTime = avgSec*1000;
                }
                else{
                    startTime = avgSec*1000 + Utils.getRandomInt(stdSec*1000);
                }
                */
               let secs = Utils.possionNumberGenerator(avgSec);
               startTime = secs * 1000;
               console.log(`Possion delay: ${secs} secs`);
               
            },(resp)=>{
                console.log('error in transaction',resp);
                if(stopOnError)
                    clearInterval(this.interval_handler);
            });
        },startTime);
    }

    public stopGenerateTransaction(){
        if(this.interval_handler)
            clearInterval(this.interval_handler);
    }

    public toString(){
        let url = this.url;
        let avgSec = this.avgSec;
        let stdSec = this.stdSec;
        let stopOnError = this.stopOnError;
        return `${url}-${avgSec}-${stdSec}-${stopOnError}`;
    }
    

}
