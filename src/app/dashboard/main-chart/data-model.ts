export interface DataModel {
    currency: string;
    current: TimePrice;
    color: string;  
  }
  export interface TimePrice {
    t: Date;
    y: number;
  }
  export class PriceData {
    ts: number;
    price: number;
  }
  