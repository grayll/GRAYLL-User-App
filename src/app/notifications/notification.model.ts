export class GRY1NotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public positionId?: number,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}

export class AlgoNotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public positionId?: number,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}

export class WalletNotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public transactionId?: number,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}

export class GeneralNotificationModel {
  constructor(
    public id?: number,
    public subject?: string,
    public content?: string,
    public isRead?: boolean,
    public datetime?: any
  ) {}
}
