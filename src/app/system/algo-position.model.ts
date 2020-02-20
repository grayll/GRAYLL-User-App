export class AlgoPositionModel {
  constructor(
    public id?: number,
    public item?: string,
    public usdValue?: any,
    public itemAmount?: any,
    public token?: number,
    public grxAmount?: any,
    public grxPrice?: number, 
    public itemPrice?: number,
    public positionValue?: number,
    public stellarTxId?: string,
  ) {}
}

export interface AlgoPositionModel1 {id?: number;
    item?: string;
    usdValue?: number;
    itemAmount?: number;
    token?: number;
    grxAmount?: number;  
    grxPrice?: number;  
    itemPrice?: number;  
    positionValue?: number;  
}

export interface AlgoModel {id?: number;
  type: string;
  usdValue: number;
  numberItems: number;  
  grxAmount?: number;  
}
