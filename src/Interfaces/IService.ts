export type IdType = string | number;
export interface DataReturned<I> {
    error: boolean;
    message: string;
    data?: I;
}
type ModelType = Object & IdType;
export interface IService<P> {
    getOne: (id: IdType) => Promise<DataReturned<P>>;
    getMany: (filter: Partial<P>) => Promise<DataReturned<Array<P>>>;
    create: (data: P) => Promise<DataReturned<undefined>>;
    update: (id: IdType, data: Partial<P>) => Promise<DataReturned<undefined>>;
    delete: (id: IdType) => Promise<DataReturned<undefined>>;
}
