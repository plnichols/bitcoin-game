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
