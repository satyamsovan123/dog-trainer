enum MessageType {
  Success,
  Error,
}
export interface Notification {
  message: string;
  type: MessageType;
}
