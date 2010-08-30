DV.Schema.events.viewFullscreen = {
  open: function(e){
    e.preventDefault();
    this.states.ViewFullscreen();

    return false;
  },
  
  close: function(e) {
    e.preventDefault();
    this.states.ViewFullscreen();
    
    return false;
  }
};