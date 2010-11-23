// Create a thumbnails view for a given viewer, using a URL template, and
// the number of pages in the document.
DV.Thumbnails = function(viewer){
  this.currentPage  = null;
  this.zoomLevel    = null;
  this.imageUrl     = viewer.schema.document.resources.page.image.replace(/\{size\}/, 'small');
  this.pageCount    = viewer.schema.document.pages;
  this.viewer       = viewer;
  this.scrollTimer  = null;
  _.bindAll(this, 'lazyloadThumbnails', 'loadThumbnails');
};

// Render the Thumbnails from scratch.
DV.Thumbnails.prototype.render = function() {
  this.calculateZoom();
  var thumbnailsHTML = JST.thumbnails({
    pageCount : this.pageCount,
    zoom      : this.zoomLevel,
    imageUrl  : this.imageUrl
  });
  this.viewer.$('.DV-thumbnails').html(thumbnailsHTML);
  this.setZoom();
  this.viewer.elements.window.unbind('scroll.pages').bind('scroll.pages', this.lazyloadThumbnails);
  this.loadThumbnails();
};

// Set the appropriate zoomLevel class for the thumbnails.
DV.Thumbnails.prototype.setZoom = function(zoomLevel) {
  if (zoomLevel != null) this.calculateZoom(zoomLevel);
  var el = this.viewer.$('.DV-thumbnails-zoom');
  el[0].className = el[0].className.replace(/DV-zoom-\d\s*/, '');
  el.addClass('DV-zoom-' + this.zoomLevel);
};

// The thumbnails (unfortunately) have their own notion of the current zoom
// level -- specified from 0 - 4.
DV.Thumbnails.prototype.calculateZoom = function(zoomLevel) {
  if (zoomLevel != null) {
    this.zoomLevel = _.indexOf(this.viewer.models.document.ZOOM_RANGES, zoomLevel);
  } else {
    this.zoomLevel = this.viewer.slider.slider('value');
  }
};

DV.Thumbnails.prototype.lazyloadThumbnails = function() {
  if (this.scrollTimer) clearTimeout(this.scrollTimer);
  this.scrollTimer = setTimeout(this.loadThumbnails, 100);
};

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
  var topPage       = Math.floor(scrollTop / firstHeight * pagesPerRow);
  var bottomPage    = Math.ceil(scrollBottom / firstHeight * pagesPerRow);

  // Round to the nearest whole row.
  topPage           -= (topPage % pagesPerRow);
  bottomPage        += pagesPerRow - (bottomPage % pagesPerRow) + 1;

  // Qualify selectors.
  var gt            = topPage > 0 ? ':gt(' + topPage + ')' : '';
  var lt            = bottomPage <= this.pageCount ? ':lt(' + bottomPage + ')' : '';

  viewer.$('.DV-thumbnail' + gt + lt).each(function(i) {
    var el = viewer.$(this);
    if (!el.hasClass('DV-loaded')) {
      var image = viewer.$('.DV-thumbnail-image', el);
      image.attr({src: image.attr('data-src')});
      el.addClass('DV-loaded');
    }
  });
};
