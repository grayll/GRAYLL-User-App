export class AllTransactionsModel {
	constructor(
		public id?: number,
		public openDate?: any,
		public firstName?: string,
		public lastName?: string,
		public businessName?: string,
		public eMail?: string,
		public phoneNumber?: string,
		public totalFees?: string,
		public totalPayments?: string,
		public remindersSent?: number,
		public lastReminder?: any,
		public stellarTransactionId?: string
	) {}
}
