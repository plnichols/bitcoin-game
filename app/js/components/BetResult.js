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
