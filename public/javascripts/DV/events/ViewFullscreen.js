DV.Schema.events.viewFullscreen = {
  open: function(e){
    e.preventDefault();
    this.application.open('ViewFullscreen');

    return false;
  },
  
  close: function(e) {
    e.preventDefault();
    this.application.open('ViewFullscreen');
    
    return false;
  }
};