var app = app || {};

(function () {
  'use strict';


  // init models
  app.account_balance_model = new app.AccountBalanceModel();
  app.bitcoin_model = new app.BitcoinModel();
  app.bet_model = new app.BetModel();

  // init views
  app.account_balance_view = new app.AccountBalanceView({ model: app.account_balance_model });
  app.market_rate_view = new app.MarketRateView({ model: app.bitcoin_model });
  app.bet_selection_view = new app.BetSelectionView({ model: app.bet_model });
})();