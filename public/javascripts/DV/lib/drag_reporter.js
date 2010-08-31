DV.DragReporter = function(toWatch, dispatcher, argHash) {
  this.dragClassName  = 'DV-dragging';
  this.sensitivity    = 1.5;
  this.oldPageY       = 0;

  _.extend(this, argHash);

  this.dispatcher             = dispatcher;
  this.toWatch                = jQuery(toWatch);
  this.boundReporter          = jQuery.proxy(this.mouseMoveReporter,this);
  this.boundMouseUpReporter   = jQuery.proxy(this.mouseUpReporter,this);
  this.boundMouseDownReporter = jQuery.proxy(this.mouseDownReporter,this);
  this.boundEase              = jQuery.proxy(this.boundEase,this);

  this.setBinding();
};

DV.DragReporter.prototype.shouldIgnore = function(e) {
  if (!this.ignoreSelector) return false;
  var el = jQuery(e.target);
  return el.parents().is(this.ignoreSelector) || el.is(this.ignoreSelector);
};

DV.DragReporter.prototype.mouseUpReporter     = function(e){
  if (this.shouldIgnore(e)) return true;
  e.preventDefault();
  clearInterval(this.updateTimer);
  this.stop();
};

DV.DragReporter.prototype.oldPositionUpdater   = function(){
  this.oldPageY = this.pageY;
};

DV.DragReporter.prototype.stop         = function(){
  this.toWatch.removeClass(this.dragClassName);
  this.toWatch.unbind('mousemove');
};

DV.DragReporter.prototype.setBinding         = function(){
  this.toWatch.mouseup(this.boundMouseUpReporter);
  this.toWatch.mousedown(this.boundMouseDownReporter);
};

DV.DragReporter.prototype.unBind           = function(){
  this.toWatch.unbind('mouseup',this.boundMouseUpReporter);
  this.toWatch.unbind('mousedown',this.boundMouseDownReporter);
};

DV.DragReporter.prototype.destroy           = function(){
  this.unBind();
  this.toWatch = null;
};

DV.DragReporter.prototype.mouseDownReporter   = function(e){
   if (this.shouldIgnore(e)) return true;
  e.preventDefault();
  this.pageY    = e.pageY;
  this.pageX    = e.pageX;
  this.oldPageY = e.pageY;

  this.updateTimer = setInterval(jQuery.proxy(this.oldPositionUpdater,this),1200);

  this.toWatch.addClass(this.dragClassName);
  this.toWatch.mousemove(this.boundReporter);
};

DV.DragReporter.prototype.mouseMoveReporter     = function(e){
  if (this.shouldIgnore(e)) return true;
  e.preventDefault();
  var delta       = Math.round(this.sensitivity * (this.pageY - e.pageY));
  var direction   = (delta > 0) ? 'down' : 'up';
  this.pageY      = e.pageY;
  if (delta === 0) return;
  this.dispatcher({ event: e, delta: delta, direction: direction });
};
