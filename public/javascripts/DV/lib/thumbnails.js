DV.Thumbnails = function(viewer){
  this.currentPage  = null;
  this.thumbnails   = {};
  this.pageCount    = viewer.schema.document.pages;
  this.imageUrl     = viewer.schema.document.resources.page.image;
  this.imageUrl     = this.imageUrl.replace(/\{size\}/, 'thumbnail');
  this.viewer       = viewer;
  this.buildThumbnails();
};

// build the basic page presentation layer
DV.Thumbnails.prototype.buildThumbnails = function(options) {
  options = options || {};
  
  for (var i=1; i <= this.pageCount; i++) {
    this.thumbnails[i] = this.imageUrl.replace(/\{page\}/, i);
  }
};

DV.Thumbnails.prototype.getImageUrl = function(pageNumber) {
  return this.imageUrl.replace(/\{page\}/, pageNumber);
};

DV.Thumbnails.prototype.renderThumbnails = function() {
  var viewer = this.viewer;
  var thumbnailsHTML = JST.thumbnails({
    pageCount : this.pageCount,
    thumbnails : this.thumbnails
  });
  viewer.$('.DV-thumbnails').html(thumbnailsHTML);
  var currentPage = viewer.models.document.currentPageIndex + 1;
  viewer.$('#DV-thumbnail-' + currentPage).addClass('DV-currentPage');
  viewer.$('.DV-thumbnail').each(function(i) {
    viewer.$(this).data('pageNumber', i+1);
  });
};