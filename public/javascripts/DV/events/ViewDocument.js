DV.Schema.events.ViewDocument = {
  next: function(){
    var nextPage = this.models.document.nextPage();
    this.helpers.jump(nextPage);
    
    this.application.history.save('document/p'+(nextPage+1));
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.helpers.jump(previousPage);

    this.application.history.save('document/p'+(previousPage+1));
  },
  search: function(e){
    e.preventDefault();

    this.application.open('ViewSearch');
    return false;
  }
}  