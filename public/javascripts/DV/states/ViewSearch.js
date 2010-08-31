DV.Schema.states.ViewSearch = {
  ViewSearch: function(){
    this.pageSet.cleanUp();
    this.helpers.removeObserver('drawPages');
    this.dragReporter.unBind();
    this.elements.window.scrollTop(0);

    if(this.elements.searchInput.val() == '') {
      this.elements.searchInput.val(searchRequest);
    } else {
      var searchRequest = this.elements.searchInput.val();
    }

    this.helpers.getSearchResponse(searchRequest);
    this.acceptInput.deny();

    this.helpers.toggleContent('viewSearch');

    return true;
  }
};