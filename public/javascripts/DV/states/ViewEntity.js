DV.Schema.states.ViewEntity = {
  ViewEntity: function(name, offset, length) {
    this.helpers.removeObserver('drawPages');
    this.dragReporter.unBind();
    this.elements.window.scrollTop(0);
    this.helpers.toggleContent('viewSearch');
    this.helpers.showEntity(name, offset, length);
  }
};