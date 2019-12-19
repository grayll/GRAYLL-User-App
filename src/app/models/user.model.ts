export class UserModel {
  constructor(
    public id?: number,
    public is2FAEnabled?: boolean,
    public isAccountActivated?: boolean,
    public isLoadPaid?: boolean,
    public XLMBalance?: number
  ) {}
}

export class UserInfo {
  constructor( 
    public Uid: string,
    public EnSecretKey: string,
    public SecretKeySalt: string,
    public LoanPaidStatus: string,
    public Tfa: boolean,
    public Expire:number,
    public Setting?:Setting,
    ) 
  {
    
  }
} 

export class Setting {
  constructor( 
    public AppAlgo: boolean,
    public AppGeneral: boolean,
    public AppWallet: boolean,
    public IpConfirm: boolean,
    public MailAlgo: boolean,
    public MailGeneral: boolean,
    public MailWallet: boolean,
    public MulSignature: boolean,
    ) 
  {
    
  }
}

// UserInfo {
//   EnSecretKey: string;
//   SecretKeySalt: string;
//   LoanPaidStatus: string;
//   TfaEnable: boolean;
//   Expire:number;
// }
