export type TrackEventType = {
  /*
    Send
   */
  (event: 'Send_Viewed'): void;
  (event: 'Send_Max_Info_Showed'): void;
  (event: 'Send_Verification_Invoked'): void;
  (event: 'Send_Reviewing'): void;
  (event: 'Send_Process_Shown'): void;

  /*
    Swap
   */
  (event: 'Swap_Viewed'): void;
  (event: 'Swap_Process_Shown'): void;
  (event: 'Swap_Reversing'): void;
  (event: 'Swap_Verification_Invoked'): void;

  /*
    Buy
   */
  (event: 'Buy_Viewed'): void;
  (event: 'Buy_Fees_Showed'): void;
  (event: 'Buy_Provider_Step_Viewed'): void;

  /*
    Receive
   */
  (event: 'Receive_Viewed'): void;
  (event: 'Receive_Username_Copied'): void;
  (event: 'Receive_Address_Copied'): void;
  (event: 'Receive_QR_Saved'): void;
  (event: 'Receive_Changing_Network'): void;
  (event: 'Receive_Network_Changed', data: { Receive_Network: 'solana' | 'bitcoin' }): void;
  (event: 'Receive_Viewing_Explorer', data: { Receive_Network: 'solana' | 'bitcoin' }): void;
  (event: 'Receive_Topping_Up'): void;

  /*
    Settings
   */
  (event: 'Sign_Out'): void;

  /*
    Left Nav Menu
   */
  (event: 'App_Store_Pressed'): void;
  (event: 'Google_Play_Pressed'): void;

  // /*
  //  * landing
  //  */
  // // Пользователь попадает на страницу
  // (event: 'landing_open'): void;
  // // Пользователь нажал "I have wallet"
  // (event: 'landing_i_have_wallet_click'): void;
  // // Пользователь нажал "Create Wallet"
  // (event: 'landing_create_wallet_click'): void;
  // // Пользователь нажал "Go to web wallet 1"
  // (event: 'landing_go_to_web_wallet_1_click'): void;
  // // Пользователь нажал "Go to web wallet 2"
  // (event: 'landing_go_to_web_wallet_2_click'): void;
  // // Пользователь нажал "Go to web wallet 3"
  // (event: 'landing_go_to_web_wallet_3_click'): void;
  // // Пользователь нажал "Download for iOS 1"
  // (event: 'landing_download_for_ios_1_click'): void;
  // // Пользователь нажал "Download for iOS 2"
  // (event: 'landing_download_for_ios_2_click'): void;
  // // Пользователь нажал "Download for iOS 3"
  // (event: 'landing_download_for_ios_3_click'): void;
  // // Пользователь нажал "Download for iOS 4"
  // (event: 'landing_download_for_ios_4_click'): void;
  //
  // /*
  //  * signup
  //  */
  // // Пользователь попадает на страницу SignUp
  // (event: 'signup_open'): void;
  // // Пользователь нажимает на "I have saved these words in a safe place."
  // (event: 'signup_i_have_saved_words_click'): void;
  // // Пользователь нажимает "Continue"
  // (event: 'signup_continue_mnemonic_click'): void;
  // // Пользователь попадает на страницу "Paste your seed phrase"
  // (event: 'signup_paste_seed_open'): void;
  // // Пользователь вставил фразу
  // (event: 'signup_seed_pasted'): void;
  // // Пользователь нажал "Continue"
  // (event: 'signup_continue_paste_click'): void;
  // // Пользователь попадает на страницу "Create password"
  // (event: 'signup_create_password_open'): void;
  // // Пользователь вводит пароль
  // (event: 'signup_password_keydown'): void;
  // // Пользователь подтверждает пароль
  // (event: 'signup_password_confirm_keydown'): void;
  // // Пользователь нажал "Continue"
  // (event: 'signup_continue_create_password_click'): void;
  // // Пользователь попадает на страницу "Your wallet is ready!"
  // (event: 'signup_wallet_ready_open'): void;
  // // Пользователь нажал "Finish setup"
  // (
  //   event: 'signup_finish_setup_click',
  //   data: {
  //     fastEnter: boolean;
  //   },
  // ): void;
  //
  // /*
  //  * login
  //  */
  // // Пользователь попадает на страницу "Log in to your wallet"
  // (event: 'login_open'): void;
  // // Выбирает "Sollet.io"
  // (event: 'login_solletio_click'): void;
  // // Выбирает "Sollet Extension"
  // (event: 'login_sollet_extension_click'): void;
  // // Выбирает "Phantom"
  // (event: 'login_phantom_click'): void;
  // // Вводит seed
  // (event: 'login_seed_keydown'): void;
  // // Пользователь попадает на страницу "Create password"
  // (event: 'login_create_password_open'): void;
  // // Пользователь вводит пароль
  // (event: 'login_password_keydown'): void;
  // // Пользователь подтверждает пароль
  // (event: 'login_password_confirm_keydown'): void;
  // // Пользователь нажал "Continue"
  // (event: 'login_continue_create_password_click'): void;
  // // Пользователь выбирает Derivation path
  // (event: 'login_select_derivation_path_click', { derivationPath: string }): void;
  // // Пользователь нажал "Continue"
  // (event: 'login_continue_derivation_path_click', { derivationPath: string }): void;
  // // Пользователь попадает на страницу "Your wallet is ready!"
  // (event: 'login_wallet_ready_open'): void;
  // // Пользователь нажал "Finish setup"
  // (
  //   event: 'login_finish_setup_click',
  //   data: {
  //     fastEnter: boolean;
  //   },
  // ): void;
  //
  // /*
  //  * restore
  //  */
  // // Пользователь попадает на страницу "Welcome back!"
  // (event: 'restore_welcome_back_open'): void;
  // // Пользователь вводит пароль
  // (event: 'restore_password_keydown'): void;
  // // Пользователь нажимает "Access my wallet"
  // (event: 'restore_access_wallet_click'): void;
  // // Пользователь нажимает "Access via seed phrase"
  // (event: 'restore_access_via_seed_click'): void;
  //
  // /*
  //  * wallets
  //  */
  // // Пользователь попадает на страницу "Wallets"
  // (event: 'wallets_open'): void;
  //
  // /*
  //  * wallet
  //  */
  // // Пользователь попадает на страницу "Token Details"
  // (event: 'wallet_open', data: { tokenTicker: string }): void;
  // // Пользователь нажимает на "QR"
  // (event: 'wallet_qr_click'): void;
  // // Пользователь копирует SOL адрес
  // (event: 'wallet_sol_address_copy'): void;
  // // Пользователь копирует Token адрес
  // (event: 'wallet_token_address_copy'): void;
  // // Пользователь копирует Mint адрес
  // (event: 'wallet_mint_address_copy'): void;
  // // Пользователь нажимает "Send"
  // (event: 'wallet_send_click'): void;
  // // Пользователь нажимает "Swap"
  // (event: 'wallet_swap_click'): void;
  // // Пользователь листает "Activity"
  // (event: 'wallet_activity_scroll', { pageNum: number }): void;
  // // Пользователь переходит в детали транзакции
  // (event: 'wallet_transaction_details_open'): void;
  //
  // /*
  //  * receive
  //  */
  // // Пользователь попадает на страницу "Receive"
  // (event: 'receive_open', data: { fromPage: string }): void;
  // // Пользователь копирует адрес
  // (event: 'receive_address_copy'): void;
  //
  // /*
  //  * send
  //  */
  // // Пользователь попадает на страницу "Send"
  // (event: 'send_open', data: { fromPage: string }): void;
  // // Пользователь выбирает монету
  // (event: 'send_select_token_click', data: { tokenTicker: string }): void;
  // // Пользователь вводит сумму
  // (event: 'send_amount_keydown', data: { sum: number }): void;
  // // Пользователь нажимает на "Available"
  // (event: 'send_available_click', data: { sum: number }): void;
  // // Пользователь вводит адрес
  // (event: 'send_address_keydown'): void;
  // // Пользователь нажимает "Send"
  // (event: 'send_send_click', data: { tokenTicker: string; sum: number }): void;
  // // Пользователь нажимает "Close"
  // (event: 'send_close_click', data: { transactionConfirmed: boolean }): void;
  // // Пользователь нажимает "Done"
  // (event: 'send_done_click', data: { transactionConfirmed: boolean }): void;
  // // Пользователь нажимает "View in explorer"
  // (event: 'send_explorer_click', data: { transactionConfirmed: boolean }): void;
  // // Пользователь нажимает "Try again"
  // (event: 'send_try_again_click', data: { error: string }): void;
  // // Пользователь нажимает "Cancel"
  // (event: 'send_cancel_click', data: { error: string }): void;
  //
  // /*
  //  * swap
  //  */
  // // Пользователь попадает на страницу "Swap"
  // (event: 'swap_open', data: { fromPage: string }): void;
  // // Пользователь выбирает монету A (монета A)
  // (event: 'swap_token_a_select_click', data: { tokenTicker: string }): void;
  // // Пользователь выбирает монету B (монета B)
  // (event: 'swap_token_b_select_click', data: { tokenTicker: string }): void;
  // // Пользователь вводит сумму A (сумма A)
  // (event: 'swap_token_a_amount_keydown', data: { sum: number }): void;
  // // Пользователь вводит сумму B (сумма B)
  // (event: 'swap_token_b_amount_keydown', data: { sum: number }): void;
  // // Пользователь нажимает "Available" (сумма)
  // (event: 'swap_available_click', data: { sum: number }): void;
  // // Пользователь нажимает "Поменять местами"
  // (event: 'swap_reverse_click'): void;
  // // Пользователь нажимает "Slippage"
  // (event: 'swap_slippage_click'): void;
  // // Пользователь устанавливает новое значение "Slippage"
  // (event: 'swap_slippage_done_click', data: { slippage: number }): void;
  // // Пользователь нажимает "Swap Now"
  // (
  //   event: 'swap_swap_click',
  //   data: { tokenA: string; tokenB: string; sumA: number; sumB: number },
  // ): void;
  // // Пользователь нажимает "Close"
  // (event: 'swap_close_click', data: { transactionConfirmed: boolean }): void;
  // // Пользователь нажимает "Done"
  // (event: 'swap_done_click', data: { transactionConfirmed: boolean }): void;
  // // Пользователь нажимает "View in explorer"
  // (event: 'swap_explorer_click', data: { transactionConfirmed: boolean }): void;
  // // Пользователь нажимает "Try again"
  // (event: 'swap_try_again_click', data: { error: string }): void;
  // // Пользователь нажимает "Cancel"
  // (event: 'swap_cancel_click', data: { error: string }): void;
  //
  // /*
  //  * settings
  //  */
  // // Пользователь попадает на страницу "Settings"
  // (event: 'settings_open', data: { fromPage: string }): void;
  // // Выбирает "Network"
  // (event: 'settings_network_click', data: { endpoint: string }): void;
  // // Переключает "Hide zero balances"
  // (event: 'settings_hide_zero_balances_click', data: { hide: boolean }): void;
  // // Нажимает "Logout"
  // (event: 'settings_logout_click'): void;
};
