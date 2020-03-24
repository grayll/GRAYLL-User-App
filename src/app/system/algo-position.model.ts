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
    public grayllTxId?: string,
    public openFee$?: number,
    public positionValueGRX?: number,
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

export interface AlgoPosition {id?: number;
  item?: string;
  usdValue?: number;
  itemAmount?: number;
  token?: number;
  grxAmount?: number;  
  grxPrice?: number;  
  itemPrice?: number;  
  positionValue?: number;  
}

export interface OpenPosition {
  grayll_transaction_id: string;
  open_stellar_transaction_id: number;
  algorithm_type:string
  time?: string,
  url?: string,
  open_position_timestamp: number
  open_position_fee_$: number
  open_position_fee_GRX: number
  open_position_value_$: number
  open_position_total_GRX: number
  open_position_value_GRZ: number
  open_position_value_GRX: number
  open_value_GRZ: number
  open_value_GRX: number
  open_value_GRY?: number

  duration?: number
  status: string

  current_value_GRX?: number
  current_value_GRZ?: number
  current_value_GRY?: number
  current_position_value_$?: number
  current_position_value_GRX?: number
  current_position_ROI_$?: number
  current_position_ROI_percent?: number  
}

export interface ClosePosition extends OpenPosition{
  close_position_timestamp?: number
  close_position_total_$?: number
  close_position_total_GRX?: number
  close_position_value_GRZ?: number
  close_position_value_GRY?: number

  close_position_fee_$?: number
  close_performance_fee_$?: number
  close_performance_fee_GRX?: number
  close_position_value_$?: number
  close_position_value_GRX?: number
  close_position_ROI_$?: number

  close_position_ROI_percent?: number
  close_stellar_transaction_id?: number;
}

export interface AlgoModel {id?: number;
  type: string;
  usdValue: number;
  numberItems: number;  
  grxAmount?: number;  
}
