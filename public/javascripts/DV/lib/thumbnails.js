// Create a thumbnails view for a given viewer, using a URL template, and
// the number of pages in the document.
DV.Thumbnails = function(viewer){
  this.currentPage  = null;
  this.zoomLevel    = null;
  this.scrollTimer  = null;
  this.imageUrl     = viewer.schema.document.resources.page.image.replace(/\{size\}/, 'small');
  this.pageCount    = viewer.schema.document.pages;
  this.viewer       = viewer;
  this.resizeId     = _.uniqueId();
  _.bindAll(this, 'lazyloadThumbnails', 'loadThumbnails');
};

// Render the Thumbnails from scratch.
DV.Thumbnails.prototype.render = function() {
  this.el = this.viewer.$('.DV-thumbnails');
  this.getZoom();
  this.el.empty();
  this.buildPages(1, Math.min(100, this.pageCount));
  if (this.pageCount > 100) {
    _.defer(_.bind(this.buildPages, this, 101, this.pageCount));
  }
  this.setZoom();
  this.viewer.elements.window.unbind('scroll.pages').bind('scroll.pages', this.lazyloadThumbnails);
  var resizeEvent = 'resize.pages-' + this.resizeId;
  DV.jQuery(window).unbind(resizeEvent).bind(resizeEvent, this.lazyloadThumbnails);
  this.loadThumbnails();
};

DV.Thumbnails.prototype.buildPages = function(startPage, endPage) {
  var thumbnailsHTML = JST.thumbnails({
    page      : startPage,
    endPage   : endPage,
    zoom      : this.zoomLevel,
    imageUrl  : this.imageUrl
  });
  this.el.html(this.el.html() + thumbnailsHTML);
};

// Set the appropriate zoomLevel class for the thumbnails.
DV.Thumbnails.prototype.setZoom = function() {
  this.getZoom();
  this.el[0].className = this.el[0].className.replace(/DV-zoom-\d\s*/, '');
  this.el.addClass('DV-zoom-' + this.zoomLevel);
};

// The thumbnails (unfortunately) have their own notion of the current zoom
// level -- specified from 0 - 4.
DV.Thumbnails.prototype.getZoom = function() {
  this.zoomLevel = this.viewer.slider.slider('value');
};

// Only attempt to load the current viewport's worth of thumbnails if we've
// been sitting still for at least 1/10th of a second.
DV.Thumbnails.prototype.lazyloadThumbnails = function() {
  if (this.scrollTimer) clearTimeout(this.scrollTimer);
  this.scrollTimer = setTimeout(this.loadThumbnails, 100);
};

// Load the currently visible thumbnails, as determined by the size and position
// of the viewport.
DV.Thumbnails.prototype.loadThumbnails = function() {
  var viewer        = this.viewer;
  var width         = viewer.$('.DV-thumbnails').width();
  var height        = viewer.elements.window.height();
  var scrollTop     = viewer.elements.window.scrollTop();
  var scrollBottom  = scrollTop + height;
  var first         = viewer.$('.DV-thumbnail:first-child');
  var firstTop      = first.position().top;
  var firstHeight   = first.outerHeight(true);
  var firstWidth    = first.outerWidth(true);

  // Determine the top and bottom page.
  var pagesPerRow   = Math.floor(width / firstWidth);
  var startPage     = Math.floor(scrollTop / firstHeight * pagesPerRow);
  var endPage       = Math.ceil(scrollBottom / firstHeight * pagesPerRow);

  // Round to the nearest whole row.
  startPage         -= (startPage % pagesPerRow) + 1;
  endPage           += pagesPerRow - (endPage % pagesPerRow);

  this.loadImages(startPage, endPage);
};

// Load all of the images within a range of visible pages.
DV.Thumbnails.prototype.loadImages = function(startPage, endPage) {
  var viewer = this.viewer;
  var gt = startPage > 0 ? ':gt(' + startPage + ')' : '';
  var lt = endPage <= this.pageCount ? ':lt(' + endPage + ')' : '';
  viewer.$('.DV-thumbnail' + lt + gt).each(function(i) {
    var el = viewer.$(this);
    if (!el.hasClass('DV-loaded')) {
      var image = viewer.$('.DV-thumbnail-image', el);
      image.attr({src: image.attr('data-src')});
      el.addClass('DV-loaded');
    }
  });
};
