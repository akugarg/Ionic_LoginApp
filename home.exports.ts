import {Injectable} from '@angular/core';
@Injectable()

export class user{
    _id:string;
    email:string;
    role:string;
  }

  export class poll{
    name:any;
    status:string;
    owner:string;
    pools:{};
  }
  export interface Food {
    value: string;
    viewValue: string;
  }

  export class CrePoll{
    m:number;
    s:number;
    b:boolean;
    z:Array<number>;
  }