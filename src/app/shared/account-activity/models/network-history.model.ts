export class NetworkHistoryModel {
  constructor(
    public id?: string,
    public date?: any,
    public operation?: string,
    public amount?: string,
    public asset?: string,
    public account?: string
  ) {}
}
