export default class Storage{
    private static instance: Storage;
    private _storage: Map<string, any>;
    private constructor(){
        this._storage = new Map();
    }
    public get = (key: string)=>{
        return this._storage.get(key);
    }
    public delete = (key: string) => {
        this._storage.delete(key);
    }
    public set = (key: string, value: any) => {
        this._storage.set(key, value);
    }
    public has = (key: string) => {
        return this._storage.has(key);
    }
    public entries = () => {
        return this._storage.entries();
    }
    public pull = (keyStore: string, key: string) => {
        const array = this._storage.get(keyStore);
        if(array){
            delete array[key];
            this._storage.set(keyStore, array);
        }
    }
    public static getInstance(){
        if(!Storage.instance){
            Storage.instance = new Storage();
        }
        return Storage.instance;
    }
}