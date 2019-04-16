import Cloud from './lean_cloud';
import global_states from './states';

export default class Storage{
    cloud: Cloud;
    
    constructor(){
        this.cloud = new Cloud();
    }
    
    addNewExperiment(id:string,user:string,description:string){
        let route = '/classes/Experiments';
        let data = {'ID':id,'comment':description,'user':user};
        return this.cloud.lean_cloud_post(route,data);
    }
}