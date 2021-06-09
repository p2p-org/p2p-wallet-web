export interface TrackEventType {
  /*
   * Landing
   */
  // Пользователь нажал "I have wallet"
  (event: 'i_have_wallet_click'): void;
  // Пользователь нажал "Go to web wallet 1"
  (
    event: 'go_to_web_wallet_1_click',
    data: {
      userId: string;
    },
  ): void;
}
