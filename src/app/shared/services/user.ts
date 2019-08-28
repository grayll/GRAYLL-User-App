export interface User {
   Uid?: string;
   Email: string;  
   PhotoURL?: string;
   EmailVerified?: boolean;
   Name?: string;
   Lname?: string;
   Tfa?: Tfa;
   Token?: string;
   Setting?: Setting;
}
export interface Tfa {
   Secret: string;
   Enable: boolean;
   TempUrl?: string;  
   Exp?: number; 
}

export interface Setting {   
   IpConfirm: boolean;
   MulSignature?: boolean;   
}