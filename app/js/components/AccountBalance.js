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
      if (localStorage.getItem('userAccountDetails')) {
        this.set('balance', JSON.parse(localStorage.getItem('userAccountDetails')).balance);
      }
      else {
        this.set('balance', 100);
      }
      
      this.save(this.get('balance'));
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
