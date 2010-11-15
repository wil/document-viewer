DV.Thumbnails = function(viewer){
  this.currentPage  = null;
  this.thumbnails   = {};
  this.imageUrl     = viewer.schema.document.resources.page.image.replace(/\{size\}/, 'small');
  this.pageCount    = viewer.schema.document.pages;
  this.viewer       = viewer;
  this.buildThumbnails();
};

DV.Thumbnails.prototype.rerender = function(zoomLevel) {
  this.buildThumbnails(zoomLevel);
  this.renderThumbnails();
};

// build the basic page presentation layer
DV.Thumbnails.prototype.buildThumbnails = function(zoomLevel) {
  var zoomValue = _.indexOf(this.viewer.models.document.ZOOM_RANGES, zoomLevel);
  if (zoomLevel != null) {
    this.zoomLevel = zoomValue;
  } else {
    this.zoomLevel = this.viewer.slider.slider('value');
  }

  for (var i = 1; i <= this.pageCount; i++) {
    this.thumbnails[i] = this.imageUrl.replace(/\{page\}/, i);
  }
};

DV.Thumbnails.prototype.renderThumbnails = function() {
  var viewer = this.viewer;
  var thumbnailsHTML = JST.thumbnails({
    pageCount : this.pageCount,
    thumbnails : this.thumbnails,
    zoom : this.zoomLevel,
    removedPages : viewer.models.removedPages
  });
  viewer.$('.DV-thumbnails').html(thumbnailsHTML);

  var $thumbnails = viewer.$('.DV-thumbnail');
  $thumbnails.each(function(i) {
    viewer.$(this).data('pageNumber', i+1);
  }).bind('mouseenter.dv-remove', function() {
    viewer.$(this).addClass('DV-hover-thumbnail');
  }).bind('mouseleave.dv-remove', function() {
    viewer.$(this).removeClass('DV-hover-image').removeClass('DV-hover-thumbnail');
  });

  viewer.$('.DV-thumbnail-page', $thumbnails).bind('mouseenter.dv-thumbnails', function() {
    viewer.$(this).parents('.DV-thumbnail').eq(0).addClass('DV-hover-image');
  }).bind('mouseleave.dv-thumbnails', function() {
    viewer.$(this).parents('.DV-thumbnail').eq(0).removeClass('DV-hover-image');
  });
  this.updateSelected();
};

DV.Thumbnails.prototype.updateSelected = function() {
  var viewer = this.viewer;
  var currentPage = viewer.models.document.currentPageIndex + 1;
  viewer.$('.DV-thumbnail').removeClass('DV-currentPageImage');
  viewer.$('#DV-thumbnail-' + currentPage).addClass('DV-currentPageImage');
};
