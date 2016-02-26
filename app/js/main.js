var app = app || {};

(function(){
    
  'use strict';


  /**
   *  Account Balance Model
   *  Create Model type to store customer's account funds
   */
  app.AccountBalanceModel = Backbone.Model.extend({
    initialize: function() {
      this.fetch();
    },

    fetch: function() {

      // if (localStorage.getItem('tempBalance')) {
      //   this.set('balance', localStorage.getItem('tempBalance'));
      // }
      if (localStorage.getItem('userAccountDetails')) {
        this.set('balance', JSON.parse(localStorage.getItem('userAccountDetails')).balance);
      }
      else {
        this.set('balance', 100);
      }
      
      this.save(this.get('balance'));

      // this.set('balance', localStorage.getItem('userAccountDetails') ? JSON.parse(localStorage.getItem('userAccountDetails')).balance : 100 );

      // if balance doesn't exist, save default to localStorage
      // if ( !localStorage.getItem('userAccountDetails') ) {
        // this.save(this.get('balance'));
      // }
    },

    save: function(amount) {
      localStorage.setItem('userAccountDetails', JSON.stringify({
        balance: amount
      }));
    }
  });




  /**
   * Account Balance View
   * Create View to display customer's current funds and currency
   * Funds are updated when a bet is complete and winning/losses are added or deducted from account balance
   */
  app.AccountBalanceView = Backbone.View.extend({
    el: '#account-balance',
    template: _.template( $('#account-balance-tmpl').html() ),

    initialize: function() {
      this.model.fetch();
      this.render();
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
      return this;
    },

    displayTempBalance: function() {
      if (localStorage.getItem('tempBalance')) {
        this.model.set('balance', localStorage.getItem('tempBalance'));
        this.render();
      }
    },

    displayCurrentBalance: function() {
      this.model.fetch();
      this.render();
    }
  });


})();

var app = app || {};

(function(){
    
  'use strict';


  /**
   *  Bet Progress Model
   *  Create Model type to store in progress bet result
   */
  app.BetInProgressModel = Backbone.Model.extend({
    initialize: function() {
      this.fetch();
    },

    fetch: function() {
      this.set('bet', localStorage.getItem('bitcoinBet') ? JSON.parse(localStorage.getItem('bitcoinBet')) : {} );
      this.set('currentPrice', localStorage.getItem('bitcoinData') ? JSON.parse(localStorage.getItem('bitcoinData')).midmarket : 0 );
      this.set('currentBalance', localStorage.getItem('userAccountDetails') ? JSON.parse(localStorage.getItem('userAccountDetails')).balance : 0 );
      this.set('result', { outcome: '...' } );
    },

    save: function(data) {
      localStorage.setItem('bitcoinBetResult', JSON.stringify(data));
      localStorage.setItem('userAccountDetails', JSON.stringify({ balance: data.newBalance }));
    }
  });




  /**
   * Bet Result View
   * Create View to show bet in progress
   */
  app.BetResultView = Backbone.View.extend({
    el: '#bet-result',
    template: _.template( $('#bet-result-tmpl').html() ),

    initialize: function() {
      var that = this;

      that.model.fetch();
      that.model.set('duration', 60);
      that.render();

      setTimeout(function() {
        that.processResult();
      }, that.model.get('duration')*1000);
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
      return this;
    },

    processResult: function() {
      this.model.fetch();

      var betData = this.model.toJSON(),
          outcome = null,
          selection = betData.bet.selection,
          priceStart = betData.bet.price, 
          priceEnd = betData.currentPrice,
          currentBalance = parseInt(betData.currentBalance, 10),
          stake = parseInt(betData.bet.stake, 10);

      // check if bet won
      if (priceStart === priceEnd) {
        outcome = 'refund';
      } 
      else if ( (selection === 'lower' && priceStart > priceEnd) || (selection === 'higher' && priceStart < priceEnd) ) {
        outcome = 'won';
        currentBalance += stake;
      } 
      else {
        outcome = 'lost';
        currentBalance -= stake;
      }

      // save results
      this.model.set('result', {
        outcome: outcome,
        priceStart: priceStart,
        priceEnd: priceEnd,
        stake: stake,
        newBalance: currentBalance
      });

      this.model.save( this.model.get('result') );

      // remove temp balance
      localStorage.removeItem('tempBalance');

      // refresh view
      this.render();
      app.account_balance_view.displayCurrentBalance();
    },

    events: {
      'click .bet__replay': 'playAgain'
    },
    
    playAgain: function(event) {
      event.preventDefault();

      // switch view to bet selection
      this.$el.empty();
      app.bet_selection_view.render();
    }
  });
  

})();

var app = app || {};

(function(){
    
  'use strict';


  /**
   *  Bet Model
   *  Create Model type to store current bet selection
   *  Overriding Backbone.sync methods to use local storage only
   */
  app.BetModel = Backbone.Model.extend({
    save: function(bet) {
      localStorage.setItem('bitcoinBet', JSON.stringify(bet));
    }
  });




  /**
   * Bet Selection View
   * Create View to show bet selection form
   */
  app.BetSelectionView = Backbone.View.extend({
    el: '#bet-selection',
    template: _.template( $('#bet-selection-tmpl').html() ),

    initialize: function() {
      this.render();
    },

    render: function() {
      // show max bet based on available balance
      this.model.set('balance', JSON.parse(localStorage.getItem('userAccountDetails')).balance);

      this.$el.html( this.template( this.model.toJSON() ) );
      return this;
    },

    events: {
      'click .bet__submit': 'placeBet'
    },
    
    placeBet: function(event) {
      event.preventDefault();

      var stakeValue = this.$('.bet__stake').val(),
          selectionValue = this.$('input[type=radio]:checked').val(),
          priceValue = JSON.parse(localStorage.getItem('bitcoinData')).midmarket;

      this.model.save({
        stake: stakeValue,
        selection: selectionValue,
        price: priceValue
      });

      // update account balance
      localStorage.setItem('tempBalance', parseInt(this.model.get('balance') - stakeValue, 10 ) );
      app.account_balance_view.displayTempBalance();

      // switch view to bet result
      this.$el.empty();
      app.bet_in_progress_model = new app.BetInProgressModel();
      app.bet_result_view = new app.BetResultView({ model: app.bet_in_progress_model });
    }
  });


})();

var app = app || {};

(function(){
    
  'use strict';


  /**
   *  Bitcoin Rate Model
   *  Create Model type to fetch mid market bitcoin price in USD
   */
  app.BitcoinModel = Backbone.Model.extend({
    url: 'https://api.bitcoinaverage.com/ticker/USD/'
  });




  /**
   * Current Mid Market View
   * Create View to display the mid market bitcoin rate
   * Fetch method is called on the model every 1 second to update the current rate
   * The API updates the rates about every 9-10 seconds
   */
  app.MarketRateView = Backbone.View.extend({
    el: '#bitcoin-rate',
    template: _.template( $('#bitcoin-rate-tmpl').html() ),

    initialize: function() {
      var that = this;

      that.getData();

      setInterval(function() {
        that.getData();
      }, 1000);
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
      return this;
    },

    getData: function() {
      var that = this;

      that.model.fetch({
        success: function (data) {
          data.attributes.midmarket = that.getMidMarketRate(data.attributes.ask, data.attributes.bid);

          localStorage.setItem('bitcoinData', JSON.stringify(data.attributes));
          that.render();
        },
        error: function() {
          // TODO: 
          // show error message
        }
      });
    },

    getMidMarketRate: function(ask, bid) {
      return (Math.round((ask + bid) / 2 * 100) / 100).toFixed(2);
    }
  });


})();
