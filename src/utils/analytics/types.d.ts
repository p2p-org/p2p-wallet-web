export interface TrackEventType {
  /*
   * landing
   */
  // Пользователь нажал "I have wallet"
  (event: 'landing_i_have_wallet_click'): void;
  // Пользователь нажал "Create Wallet"
  (event: 'landing_create_wallet_click'): void;
  // Пользователь нажал "Go to web wallet 1"
  (event: 'landing_go_to_web_wallet_1_click'): void;
  // Пользователь нажал "Go to web wallet 2"
  (event: 'landing_go_to_web_wallet_2_click'): void;
  // Пользователь нажал "Go to web wallet 3"
  (event: 'landing_go_to_web_wallet_3_click'): void;
  // Пользователь нажал "Download for iOS 1"
  (event: 'landing_downloand_for_ios_1_click'): void;
  // Пользователь нажал "Download for iOS 2"
  (event: 'landing_downloand_for_ios_2_click'): void;
  // Пользователь нажал "Download for iOS 3"
  (event: 'landing_downloand_for_ios_3_click'): void;
  // Пользователь нажал "Download for iOS 4"
  (event: 'landing_downloand_for_ios_4_click'): void;

  /*
   * sign_up
   */
  // Пользователь попадает на страницу SignUp
  (event: 'sign_up_open'): void;
  // Пользователь нажимает на "I have saved these words in a safe place."
  (event: 'sign_up_i_have_saved_words_click'): void;
  // Пользователь нажимает "Continue"
  (event: 'sign_up_continue_1_click'): void;
  // Пользователь попадает на страницу "Paste your seed phrase"
  (event: 'sign_up_paste_seed_open'): void;
  // Пользователь вставил фразу
  (event: 'sign_up_seed_pasted'): void;
  // Пользователь нажал "Continue"
  (event: 'sign_up_continue_2_click'): void;
  // Пользователь попадает на страницу "Create password"
  (event: 'sign_up_create_password_open'): void;
  // Пользователь вводит пароль
  (event: 'sign_up_password_keydown'): void;
  // Пользователь подтверждает пароль
  (event: 'sign_up_password_confirm_keydown'): void;
  // Пользователь нажал "Continue"
  (event: 'sign_up_continue_3_click'): void;
  // Пользователь попадает на страницу "Your wallet is ready!"
  (event: 'sign_up_wallet_ready_open'): void;
  // Пользователь нажал на "Use fast enter with password"
  (event: 'sign_up_fast_enter_click'): void;
  // Пользователь отключает "Use fast enter with password"
  (event: 'sign_up_fast_enter_off_click'): void;
  // Пользователь нажал "Finish setup"
  (event: 'sign_up_finish_setup_click'): void;

  /*
   * log_in
   */
  // Пользователь попадает на страницу "Log in to your wallet"
  (event: 'log_in_open'): void;
  // Выбирает "Sollet.io"
  (event: 'log_in_solletio_click'): void;
  // Выбирает "Sollet Extension"
  (event: 'log_in_sollet_extension_click'): void;
  // Выбирает "Phantom"
  (event: 'log_in_phantom_click'): void;
  // Вводит seed
  (event: 'log_in_seed_keydown'): void;
  // Пользователь попадает на страницу "Welcome back!"
  (event: 'log_in_welcome_back_open'): void;
  // Пользователь вводит пароль
  (event: 'log_in_password_keydown'): void;
  // Пользователь нажимает "Access my wallet"
  (event: 'log_in_access_wallet_click'): void;
  // Пользователь нажимает "Access via seed phrase"
  (event: 'log_in_access_via_seed_click'): void;

  /*
   * main_screen
   */
  // Пользователь попадает на страницу "Wallets"
  (event: 'main_screen_wallets_open'): void;
  // Пользователь переходит на "Token Details"
  (event: 'main_screen_token_details_open', data: { tokenTicker: string }): void;
  // Пользователь переходит на "Receive"
  (event: 'main_screen_receive_open'): void;
  // Пользователь переходит на "Send"
  (event: 'main_screen_send_open'): void;
  // Пользователь переходит на "Swap"
  (event: 'main_screen_swap_open'): void;
  // Пользователь переходит на "Settings"
  (event: 'main_screen_settings_open'): void;

  /*
   * token_details
   */
  // Пользователь попадает на страницу "Token Details"
  (event: 'token_details_open', data: { tokenTicker: string }): void;
  // Пользователь нажимает на "QR"
  (event: 'token_detail_qr_click'): void;
  // Пользователь нажимает "Send"
  (event: 'token_details_send_click'): void;
  // Пользователь нажимает "Swap"
  (event: 'token_details_swap_click'): void;
  // Пользователь копирует адрес
  (event: 'token_details_address_copy'): void;
  // Пользователь листает "Activity"
  (event: 'token_details_activity_scroll'): void; // TODO: page num
  // Пользователь переходит в детали транзакции
  (event: 'token_details_details_open'): void;

  /*
   * receive
   */
  // Пользователь попадает на страницу "Receive"
  (event: 'receive_open', data: { fromPage: string }): void;
  // Пользователь копирует адрес
  (event: 'receive_address_copy'): void;

  /*
   * send
   */
  // Пользователь попадает на страницу "Send"
  (event: 'send_open', data: { fromPage: string }): void;
  // Пользователь выбирает монету
  (event: 'send_select_token_click', data: { tokenTicker: string }): void;
  // Пользователь вводит сумму
  (event: 'send_amount_keydown', data: { sum: number }): void;
  // Пользователь нажимает на "Available"
  (event: 'send_available_click', data: { sum: number }): void;
  // Пользователь вводит адрес
  (event: 'send_address_keydown'): void;
  // Пользователь нажимает "Send"
  (event: 'send_send_click', data: { tokenTicker: string; sum: number }): void;
  // Пользователь нажимает "Done"
  (event: 'send_done_click', data: { txStatus: string }): void;
  // Пользователь нажимает "View in explorer"
  (event: 'send_explorer_click', data: { txStatus: string }): void;
  // Пользователь нажимает "Try again"
  (event: 'send_try_again_click', data: { error: string }): void;
  // Пользователь нажимает "Cancel"
  (event: 'send_cancel_click', data: { error: string }): void;

  /*
   * swap
   */
  // Пользователь попадает на страницу "Swap"
  (event: 'swap_open', data: { fromPage: string }): void;
  // Пользователь выбирает монету A (монета A)
  (event: 'swap_token_a_select_click', data: { tokenTicker: string }): void;
  // Пользователь выбирает монету B (монета B)
  (event: 'swap_token_b_select_click', data: { tokenTicker: string }): void;
  // Пользователь вводит сумму A (сумма A)
  (event: 'swap_token_a_amount_keydown', data: { sum: number }): void;
  // Пользователь вводит сумму B (сумма B)
  (event: 'swap_token_b_amount_keydown', data: { sum: number }): void;
  // Пользователь нажимает "Available" (сумма)
  (event: 'swap_available_click', data: { sum: number }): void;
  // Пользователь нажимает "Поменять местами"
  (event: 'swap_reverse_click'): void;
  // Пользователь нажимает "Slippage"
  (event: 'swap_slippage_click'): void;
  // Пользователь устанавливает новое значение "Slippage"
  (event: 'swap_slippage_keydown', data: { slippage: number }): void;
  // Пользователь нажимает "Swap Now"
  (
    event: 'swap_swap_click',
    data: { tokenA: string; tokenB: string; sumA: number; sumB: number },
  ): void;
  // Пользователь нажимает "Done"
  (event: 'swap_done_click', data: { txStatus: string }): void;
  // Пользователь нажимает "View in explorer"
  (event: 'swap_explorer_click', data: { txStatus: string }): void;
  // Пользователь нажимает "Try again"
  (event: 'swap_try_again_click', data: { error: string }): void;
  // Пользователь нажимает "Cancel"
  (event: 'swap_cancel_click', data: { error: string }): void;

  /*
   * settings
   */
  // Пользователь попадает на страницу "Settings"
  (event: 'settings_open', data: { fromPage: string }): void;
  // Выбирает "Network"
  (event: 'settings_network_click', data: { endpoint: string }): void;
  // Переключает "Hide zero balances"
  (event: 'settings_hide_zero_balances_click', data: { hide: boolean }): void;
  // Нажимает "Logout"
  (event: 'settings_logout_click'): void;
}
