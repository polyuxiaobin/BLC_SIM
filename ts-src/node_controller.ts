import Connector from './connector';
import global_states from './states';

export default class NodeController{
    public valid:boolean;
    public id:string
    public url:string;
    public txGenerateInterval:number;
    public txDelay:number;
    public maxTxPerBlock:number;

    
    public constructor(url:string){
        //this.id = id;
        this.url = url;
        //let params = `?expId=${global_states['expID']}&id=${this.id}`;
        let done = (resp:any)=>{
            console.log("resp=",resp);
            console.log("node initalized");
            this.valid = true;
        };
        let fail = (resp:any)=>{
            console.log("resp=",resp);
            console.log("node failed");
            this.valid = false;
        };
        Connector.checkAlive(url,null,done,fail);
    }
    
    public configure(txGenerateInterval:number,txDelay:number,maxTxPerBlock:number){
        // args might be null
        if (this.valid)
        {
            this.txGenerateInterval = txGenerateInterval;
            this.txDelay = txDelay;
            this.maxTxPerBlock = maxTxPerBlock;
        }
        else{
            throw new Error("invalid node! configuration failed");
        }
        
    }
    public start(){
        if(!this.valid){
            throw new Error("node config is not valid");
            return;
        }
        console.log("start control delegation");
        this.createTransactionLocally();
    }
    private createTransactionLocally(){
        let randomAmount = Math.random() * 10;
        let recipient = Math.random().toString(36).substring(7);
        let sender = Math.random().toString(36).substring(7);
        let params = `transactions/new/get?amount=${randomAmount}&recipient=${recipient}&sender=${sender}`;
        /*
        $.ajax({
            url: this.url + params,
            success:(resp)=>{
                console.log("tx created",resp);
            },
            error:(resp)=>{
                console.log("error found",resp);
            }
        })
        */
        let url:string;
        if((<any>(this.url)).endsWith("/")){
            url = this.url + params;
        }
        else{
            url = this.url + "/"  +params;
        }
        Connector.checkAlive(url);
    }
}