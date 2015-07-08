define([
  './layout',
  './custom-measures',
  './header-view',
  './list-view',
  './list-footer-view'
], function (Layout, CustomMeasures, HeaderView, ListView, ListFooterView) {

  var App = new Marionette.Application(),
      init = function (options) {
        // Layout
        this.layout = new Layout({
          el: options.el
        });
        this.layout.render();

        // Collection
        this.customMeasures = new CustomMeasures({
          projectId: options.projectId
        });

        // Header View
        this.headerView = new HeaderView({
          collection: this.customMeasures,
          projectId: options.projectId
        });
        this.layout.headerRegion.show(this.headerView);

        // List View
        this.listView = new ListView({
          collection: this.customMeasures
        });
        this.layout.listRegion.show(this.listView);

        // List Footer View
        this.listFooterView = new ListFooterView({
          collection: this.customMeasures
        });
        this.layout.listFooterRegion.show(this.listFooterView);

        // Go!
        this.customMeasures.fetch();
      };

  App.on('start', function (options) {
    window.requestMessages().done(function () {
      init.call(App, options);
    });
  });

  return App;

});
