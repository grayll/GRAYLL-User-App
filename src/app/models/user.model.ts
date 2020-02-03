export class UserModel {
  constructor(
    public id?: number,
    public is2FAEnabled?: boolean,
    public isAccountActivated?: boolean,
    public isLoadPaid?: boolean,
    public XLMBalance?: number
  ) {}
}

// export class UserInfo {
//   constructor( 
//     public Uid: string,
//     public EnSecretKey: string,
//     public SecretKeySalt: string,
//     public LoanPaidStatus: number,
//     public Tfa: boolean,
//     public Expire:number,
//     public Setting?:Setting,
//     public PublicKey?:string,
//     public SellingWallet?:string,
//     public SellingPercent?:number,
//     // generated by server and used to encrypte secret key with this pwd
//     public SecondPwd?:string,
//     public SellingPrice?: number,
//   ) 
//   {
    
//   }
// } 

export interface UserInfo {
   Uid: string;
   EnSecretKey: string;
   SecretKeySalt: string;
   LoanPaidStatus: number;
   Tfa: boolean;
   Expire:number;
   Setting?:Setting;
   PublicKey?:string;
   SellingWallet?:string;
   SellingPercent?:number;
  // generated by server and used to encrypte secret key with this pwd
   SecondPwd?:string;
   SellingPrice?: number;
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
