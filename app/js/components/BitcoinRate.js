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
