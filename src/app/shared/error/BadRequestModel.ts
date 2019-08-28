export class BadRequestModel {
  constructor(
    public title ?: string,
    public entityName ?: string,
    public errorKey ?: string,
    public message ?: string,
    public params ?: string,
    public status ?: number,
    public type ?: string
  ) {}
}
