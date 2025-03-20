import { AdminProps, DispatchProps, FilesProps, MyQuery, OrderProps, ProductProps, UserProps } from "./types";



declare global{
    namespace Express {
       export interface Request {
            authUser?:UserProps |null;
            profial:UserProps,
            adminProfile:AdminProps,
            admin:AdminProps,
            notification_id:string,
            dispatch:DispatchProps,
            product:ProductProps,
            // files:FilesProps
            order:OrderProps,
            query: import('./types').MyQuery
           
            
           
        }
        
    }
}