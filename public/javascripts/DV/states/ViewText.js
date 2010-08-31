DV.Schema.states.ViewText = {
  ViewText: function(){
    this.helpers.cleanUpSearch();
    this.pageSet.cleanUp();
    this.helpers.removeObserver('drawPages');
    this.dragReporter.unBind();
    this.helpers.resetNavigationState();
    this.elements.window.scrollTop(0);
    this.acceptInput.allow();
    this.pageSet.zoomText();

    this.helpers.toggleContent('viewText');
    this.events.loadText();

    return true;
  }
};