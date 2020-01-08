export class AlgoPositionModel {
  constructor(
    public id?: number,
    public item?: string,
    public usdValue?: any,
    public itemAmount?: any,
    public token?: number,
    public grxAmount?: any
  ) {}
}

export interface AlgoPositionModel1 {id?: number;
    item?: string;
    usdValue?: number;
    itemAmount?: number;
    token?: number;
    grxAmount?: number;  
}

export interface AlgoModel {id?: number;
  type: string;
  usdValue: number;
  numberItems: number;  
  grxAmount?: number;  
}
