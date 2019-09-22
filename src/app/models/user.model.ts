export class UserModel {
  constructor(
    public id?: number,
    public is2FAEnabled?: boolean,
    public isAccountActivated?: boolean,
    public isLoadPaid?: boolean,
    public XLMBalance?: number
  ) {}
}
