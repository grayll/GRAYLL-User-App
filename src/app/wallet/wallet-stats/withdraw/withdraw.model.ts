export class WithdrawModel {
  constructor(
    public address?: string,
    public grxAmount?: number,
    public xlmAmount?: number,
    public amount?: number,
    public memoMessage?: string,
    public phoneNumber?: string,
    public emailAddress?: string,
    public asset?: string
  ) {}
}
