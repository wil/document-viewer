DV.Schema.states.ViewEntity = {
  ViewEntity: function(name, offset, length) {
    this.dragReporter.unBind();
    this.elements.window.scrollTop(0);
    this.helpers.toggleContent('viewSearch');
    this.helpers.showEntity(name, offset, length);
  },
  exit: function(destinationState) {
    this.elements.searchInput.val('');
    this.helpers.cleanUpSearch();
    return true;
  }
};