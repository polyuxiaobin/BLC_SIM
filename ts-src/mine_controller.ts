import Connector from "./connector";


export class MiningInstance{
    private continue_mining = false;
    private label:string;
    private startMiningRecursive(url:string,stopOnError=true){
        if(!this.continue_mining){
            return;
        }
        Connector.getResponse(url,null,(resp)=>{
            console.log(`${this.label} mining result=`,resp);
            this.startMiningRecursive(url,stopOnError);
        },(resp)=>{
            console.log('error in mining',resp);
        });
    }

    public constructor(public url:string,public stopOnError:boolean=true,public name, public id){
        if (name && id)
            this.label = `[${id}]${name}`;
        else if (id)
            this.label = `[${id}]`;
    }

    public startMining(){
        this.continue_mining = true;
        if(this.url)
            this.startMiningRecursive(this.url,this.stopOnError);
    }

    public stopMining(){
        this.continue_mining = false;
    }
    public toString(){
        return `${this.url}-${this.stopOnError}`;
    }
}