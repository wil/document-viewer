DV.Thumbnails = function(viewer){
  this.currentPage  = null;
  this.thumbnails   = {};
  this.imageUrl     = viewer.schema.document.resources.page.image.replace(/\{size\}/, 'small');
  this.pageCount    = viewer.schema.document.pages;
  this.viewer       = viewer;
};

DV.Thumbnails.prototype.rerender = function() {
  this.calculateZoom();
  this.buildThumbnails();
  this.renderThumbnails();
  this.setZoom();
};

// build the basic page presentation layer
DV.Thumbnails.prototype.buildThumbnails = function() {
  for (var i = 1; i <= this.pageCount; i++) {
    this.thumbnails[i] = this.imageUrl.replace(/\{page\}/, i);
  }
};

DV.Thumbnails.prototype.renderThumbnails = function() {
  var viewer = this.viewer;
  var thumbnailsHTML = JST.thumbnails({
    pageCount : this.pageCount,
    thumbnails : this.thumbnails,
    zoom : this.zoomLevel
  });
  viewer.$('.DV-thumbnails').html(thumbnailsHTML);
  this.lazyloadThumbnails();
};

DV.Thumbnails.prototype.setZoom = function(zoomLevel) {
  if (zoomLevel !== undefined) this.calculateZoom(zoomLevel);
  
  this.viewer.$('.DV-thumbnails-zoom').removeClass('DV-zoom-0')
                                      .removeClass('DV-zoom-1')
                                      .removeClass('DV-zoom-2')
                                      .removeClass('DV-zoom-3')
                                      .removeClass('DV-zoom-4')
                                      .addClass('DV-zoom-'+this.zoomLevel);
};

DV.Thumbnails.prototype.calculateZoom = function(zoomLevel) {
  var zoomValue = _.indexOf(this.viewer.models.document.ZOOM_RANGES, zoomLevel);
  if (zoomLevel != null) {
    this.zoomLevel = zoomValue;
  } else {
    this.zoomLevel = this.viewer.slider.slider('value');
  }
};

DV.Thumbnails.prototype.lazyloadThumbnails = function() {
  var self = this;
  var viewer = this.viewer;
  
  var loadThumbnails = function(scrollTop) {
    if (viewer.$('.DV-pages').scrollTop() == scrollTop) {
      var viewportHeight = viewer.$('.DV-pages').height();
      var $firstThumbnail = viewer.$('.DV-thumbnail').eq(0);
      var firstOffset = $firstThumbnail.position().top;
      var firstHeight = $firstThumbnail.outerHeight(true);
      var scrollBottom = scrollTop + viewportHeight;
      
      var thumbnailsPerRow = 0;
      // Count thumbnails in a single row. Returns early, so it's quite fast.
      viewer.$('.DV-thumbnail').each(function() {
        var $thumbnail = viewer.$(this);
        var offset = $thumbnail.position().top;
        if (offset != firstOffset) {
          thumbnailsPerRow = $thumbnail.prevAll('.DV-thumbnail').length;
          return false;
        }
      });
      
      var topThumbnail = parseInt(scrollTop / firstHeight * thumbnailsPerRow, 10);
      var bottomThumbnail = parseInt(scrollBottom / firstHeight * thumbnailsPerRow, 10);
      // Round to nearest whole row
      topThumbnail = topThumbnail - (topThumbnail % thumbnailsPerRow);
      bottomThumbnail = bottomThumbnail + (thumbnailsPerRow - (bottomThumbnail % thumbnailsPerRow)) - 1;
      viewer.$('.DV-thumbnail').each(function(i) {
        if (i < topThumbnail) return;
        if (i > bottomThumbnail) return false;
        var $thumbnail = viewer.$(this);
        _.defer(function() {
          self._loadThumbnail($thumbnail);
        });
      });
    }
  };
  loadThumbnails(viewer.$('.DV-pages').scrollTop());
  
  viewer.$('.DV-pages').unbind('scroll.dv-thumbnails').bind('scroll.dv-thumbnails', function() {
    var scrollTop = viewer.$(this).scrollTop();
    _.delay(function() {
      loadThumbnails(scrollTop);
    }, 50);
  });
};

DV.Thumbnails.prototype._loadThumbnail = function($thumbnail) {
  var viewer = this.viewer;
  
  if (!$thumbnail.hasClass('DV-loaded')) {
    var $image = viewer.$('.DV-thumbnail-page img.DV-thumbnail-image', $thumbnail);
    var $shadow = viewer.$('.DV-thumbnail-shadow img.DV-thumbnail-image', $thumbnail);
    $thumbnail.addClass('DV-loaded');
    $image.attr('src', $image.attr('data-src'));
    $shadow.attr('src', $image.attr('data-src'));
  }
};