DV.PageSet = function(applicationScope){
  this.currentPage  = null;
  this.pages        = [];
  this.application  = applicationScope;
  this.zoomText();
};

// used to call the same method with the same params against all page instances
DV.PageSet.prototype.execute = function(action,params){
  this.pages.each(function(pageInstance){
    pageInstance[action].apply(pageInstance,params);
  });
};

// build the basic page presentation layer
DV.PageSet.prototype.buildPages = function(options) {
  options = options || {};
  var pages = this.getPages();
  for(var i = 0; i < pages.length; i++) {
    var page  = pages[i];
    page.set  = this;
    page.index = i;

    // TODO: Make more explicit, this is sloppy
    this.pages[page.label] = new DV.page(page);

    if(page.currentPage == true) {
      this.currentPage = this.pages[page.label];
    }
  }
  this.application.models.annotations.renderAnnotations();
};

// used to generate references for the build action
DV.PageSet.prototype.getPages = function(){
  var _pages = [];

  this.application.elements.sets.each(function(_index,el){

    var currentPage = (_index == 0) ? true : false;
    _pages.push({ label: 'p'+_index, el: el, index: _index, pageNumber: _index+1, currentPage: currentPage });

  });

  return _pages;
};

// basic reflow to ensure zoomlevel is right, pages are in the right place and annotation limits are correct
DV.PageSet.prototype.reflowPages = function() {
  this.application.models.pages.resize();
  this.application.helpers.setActiveAnnotationLimits();
  this.redraw(false, true);
};

// reflow the pages without causing the container to resize or annotations to redraw
DV.PageSet.prototype.simpleReflowPages = function(){
  this.application.helpers.setActiveAnnotationLimits();
  this.redraw(false, false);
};

// hide any active annotations
DV.PageSet.prototype.cleanUp = function(){
  if(this.application.activeAnnotation){
    this.application.activeAnnotation.hide(true);
  }
};

DV.PageSet.prototype.zoom = function(argHash){
  if(this.application.models.document.zoomLevel === argHash.zoomLevel) return;

  var currentPage   = this.application.models.document.currentIndex();
  var _index      = currentPage - 1;
  var oldOffset     = this.application.models.document.offsets[currentPage];

  var oldZoom      = this.application.models.document.zoomLevel*1;
  var scrollPos    = this.application.elements.window.scrollTop();

  this.application.models.document.zoom(argHash.zoomLevel);

  var diff      = (parseInt(scrollPos, 10)>parseInt(oldOffset, 10)) ? scrollPos - oldOffset : oldOffset - scrollPos;

  var diffPercentage   = diff / this.application.models.pages.height;

  // this.position();
  this.reflowPages();
  this.zoomText();

  if(this.application.activeAnnotation != null){
    // FIXME:

    var args =
    {
      index: this.application.models.document.currentIndex(),
      top: this.application.activeAnnotation.y1,
      id: this.application.activeAnnotation.id
    };
    this.application.activeAnnotation = null;

    this.showAnnotation(args);
    this.application.helpers.setActiveAnnotationLimits(this.application.activeAnnotation);
  }else{
    var _offset      = Math.round(this.application.models.pages.height * diffPercentage);
    this.application.helpers.jump(this.application.models.document.currentIndex(),_offset);
  }
};

// Zoom the text container.
DV.PageSet.prototype.zoomText = function() {
  var padding = this.application.models.pages.DEFAULT_PADDING;
  var width   = this.application.models.pages.zoomLevel;
  $j('.DV-textContents').width(width - padding);
  $j('.DV-textPage').width(width);
  if (DV.options.zoom == 'auto') {
    padding = this.application.models.pages.REDUCED_PADDING;
  }
  this.application.elements.collection.css({'width' : width + padding});
};

// draw the pages
DV.PageSet.prototype.draw = function(pageCollection){
  for(var i = 0, pageCollectionLength = pageCollection.length; i < pageCollectionLength;i++){
    var page = this.pages[pageCollection[i].label];
    if (page) page.draw({ index: pageCollection[i].index, pageNumber: pageCollection[i].index+1});
  }
};

DV.PageSet.prototype.redraw = function(stopResetOfPosition, redrawAnnotations) {
  var _index = this.application.models.document.currentIndex();
  if (this.pages['p0']) this.pages['p0'].draw({ force: true, forceAnnotationRedraw : redrawAnnotations });
  if (this.pages['p1']) this.pages['p1'].draw({ force: true, forceAnnotationRedraw : redrawAnnotations });
  if (this.pages['p2']) this.pages['p2'].draw({ force: true, forceAnnotationRedraw : redrawAnnotations });

  if(redrawAnnotations && this.application.activeAnnotation){
    this.application.helpers.jump(this.application.activeAnnotation.page.index,this.application.activeAnnotation.position.top - 37);
  }
};

// set the annotation to load ahead of time
DV.PageSet.prototype.setActiveAnnotation = function(annotationId, edit){
  this.application.annotationToLoadId   = annotationId;
  this.application.annotationToLoadEdit = edit ? annotationId : null;
};

// a funky fucking mess to jump to the annotation that is active
DV.PageSet.prototype.showAnnotation = function(argHash, showHash){
  showHash = showHash || {};

  // if state is ViewAnnotation, jump to the appropriate position in the view
  // else
  // hide active annotations and locate the position of the next annotation
  // NOTE: This needs work
  if(this.application.state === 'ViewAnnotation'){

    var offset = $j('.DV-allAnnotations div[rel=aid-'+argHash.id+']')[0].offsetTop;
    this.application.elements.window.scrollTop(offset+10,'fast');
    this.application.helpers.setActiveAnnotationInNav(argHash.id);
    this.application.activeAnnotationId = argHash.id;
    DV.history.save('annotation/a'+argHash.id);
    return;
  }else{
    this.application.helpers.removeObserver('trackAnnotation');
    this.application.activeAnnotationId = null;
    if(this.application.activeAnnotation != null){
      this.application.activeAnnotation.hide();
    }
    this.setActiveAnnotation(argHash.id, showHash.edit);

    var isPage = this.application.models.annotations.byId[argHash.id].type == 'page';
    var nudge  = isPage ? -7 : 36;
    var offset = (argHash.top * this.application.models.pages.zoomFactor()) - nudge;

    for(var i = 0; i <= 2; i++){
      if (this.pages['p' + i]) {
        for(var n = 0; n < this.pages['p'+i].annotations.length; n++){
          if(this.pages['p'+i].annotations[n].id === argHash.id){
            if (!showHash.noJump) {
              this.application.helpers.jump(argHash.index, offset);
            }
            this.pages['p'+i].annotations[n].show(showHash);
            return;
          }
        }
      }
    }

    if (!showHash.noJump){
      this.application.helpers.jump(argHash.index,offset);
    }

  }
};
