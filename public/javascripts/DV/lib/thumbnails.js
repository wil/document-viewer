// Create a thumbnails view for a given viewer, using a URL template, and
// the number of pages in the document.
DV.Thumbnails = function(viewer){
  this.currentPage  = null;
  this.zoomLevel    = null;
  this.imageUrl     = viewer.schema.document.resources.page.image.replace(/\{size\}/, 'small');
  this.pageCount    = viewer.schema.document.pages;
  this.viewer       = viewer;
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
  this.lazyloadThumbnails();
  this.setZoom();
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
  var viewer = this.viewer;

  viewer.$('.DV-thumbnail:not(.DV-loaded)').unbind('appear').one('appear', function() {
    var $thumbnail = viewer.$(this);
    if (!$thumbnail.hasClass('DV-loaded')) {
      var $image = viewer.$('.DV-thumbnail-page img.DV-thumbnail-image', $thumbnail);
      $thumbnail.addClass('DV-loaded');
      $image.attr('src', $image.attr('data-src'));
    }
  });

  var loadThumbnails = function(scrollTop) {
    if (viewer.$('.DV-pages').scrollTop() == scrollTop) {
      var viewportHeight = viewer.$('.DV-pages').height();
      var $firstThumbnail = viewer.$('.DV-thumbnail').eq(0);
      var firstOffset = $firstThumbnail.position().top;
      var firstHeight = $firstThumbnail.outerHeight(true);
      var scrollBottom = scrollTop + viewportHeight;

      var thumbnailsPerRow = 0;
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
        if (i < topThumbnail || i > bottomThumbnail) return;
        viewer.$(this).trigger('appear');
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