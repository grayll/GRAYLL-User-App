export class ActivityResult {
  constructor(
    public openOrderEmptyResultTimes?: number,    
    public openOrderNextURL?: string, 
    public completedOrderEmptyResultTimes?: number,    
    public completedOrderNextURL?: string,    
    public paymentEmptyResultTimes?: number,    
    public paymentNextURL?: string,    
    // public openOrderEmptyResultTimes?: number,    
    // public openOrderNextURL?: string,       
  ) {}
}
