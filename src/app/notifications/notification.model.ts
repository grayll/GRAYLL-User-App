export interface Notice { title: string; body:string; txId?: number; isRead:boolean; time: number; times?:string }
export interface NoticeId extends Notice { id: string; }

export interface Order { 	
  "time": number;
  "type":     string;
  "asset":    string;
  "amount":   string;
  "xlmp":     number;
  "totalxlm": number;
  "priceusd": number;
  "totalusd": number;
  "offerId":  number; 
}

export interface OrderId extends Order { id: string; }

export class GRY1NotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public positionId?: number,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}

export class AlgoNotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public positionId?: number,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}
export class NoticeModel {
  constructor(
    public id?: number,
    public title?: string,
    public body?: string,
    public txId?: number,
    public isRead?: boolean,
    public time?: any
  ) {}
}

export class WalletNotificationModel {
  constructor(
    public id?: number,
    public title?: string,
    public body?: string,
    public txId?: number,
    public isRead?: boolean,
    public time?: any
  ) {}
}

export class GeneralNotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}
