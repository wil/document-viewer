DV.Schema.models.document = {
  currentPageIndex:           0,
  offsets:                    [],
  baseHeightsPortion:         [],
  baseHeightsPortionOffsets:  [],
  paddedOffsets:              [],
  totalDocumentHeight:        0,
  totalPages:                 0,
  additionalPaddingOnPage:    0,

  ZOOM_RANGES:                [500, 700, 800, 900, 1000],

  init: function(viewer){
    this.viewer                   = viewer;
    var data                      = this.viewer.schema.data;

    this.state                    = data.state;
    this.baseImageURL             = data.baseImageURL;
    this.additionalPaddingOnPage  = data.additionalPaddingOnPage;
    this.pageWidthPadding         = data.pageWidthPadding;
    this.totalPages               = data.totalPages;
    this.chapterModel             = this.viewer.models.chapters;
    this.pageModel                = this.viewer.models.pages;

    if (DV.options.zoom == 'auto') {
      this.zoomLevel              = data.zoomLevel;
    } else {
      this.zoomLevel              = DV.options.zoom || data.zoomLevel;
    }

    // The zoom level cannot go over the maximum image width.
    var maxZoom = _.last(this.ZOOM_RANGES);
    if (this.zoomLevel > maxZoom) this.zoomLevel = maxZoom;

  },
  setPageIndex : function(index) {
    this.currentPageIndex = index;
    this.viewer.elements.currentPage.text(this.currentPage());
    this.viewer.helpers.setActiveChapter(this.chapterModel.getChapterId(index));
    return index;
  },
  currentPage : function() {
    return this.currentPageIndex + 1;
  },
  currentIndex : function() {
    return this.currentPageIndex;
  },
  nextPage : function() {
    var nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.totalPages) return this.currentIndex();
    return this.setPageIndex(nextIndex);
  },
  previousPage : function() {
    var previousIndex = this.currentIndex() - 1;
    if (previousIndex < 0) return this.currentIndex();
    return this.setPageIndex(previousIndex);
  },
  zoom: function(zoomLevel,force){
    if(this.zoomLevel != zoomLevel || force === true){
      this.zoomLevel   = zoomLevel;
      this.viewer.models.pages.resize(this.zoomLevel);
      this.viewer.models.annotations.renderAnnotations();
      this.computeOffsets();
    }
  },
  computeOffsets: function() {
    var annotationModel  = this.viewer.models.annotations;
    var totalDocHeight   = 0;
    var adjustedOffset   = 0;
    var len              = this.totalPages;
    var diff             = 0;
    var scrollPos        = this.viewer.elements.window[0].scrollTop;

    for(var i = 0; i < len; i++) {
      if(annotationModel.offsetsAdjustments[i]){
        adjustedOffset   = annotationModel.offsetsAdjustments[i];
      }

      var pageHeight     = this.pageModel.getPageHeight(i);
      var previousOffset = this.offsets[i];
      var h              = this.offsets[i] = adjustedOffset + totalDocHeight;

      if((previousOffset !== h) && (h - pageHeight < scrollPos)) {
        diff += (h - previousOffset - diff);
      }

      this.baseHeightsPortion[i]        = Math.round((pageHeight + this.additionalPaddingOnPage) / 3);
      this.baseHeightsPortionOffsets[i] = (i == 0) ? 0 : h - this.baseHeightsPortion[i];

      totalDocHeight                    += (pageHeight + this.additionalPaddingOnPage);
    }

    // artificially set the scrollbar height
    if(totalDocHeight != this.totalDocumentHeight){
      diff = (this.totalDocumentHeight != 0) ? diff : totalDocHeight - this.totalDocumentHeight;
      this.viewer.helpers.setDocHeight(totalDocHeight,diff);
      this.totalDocumentHeight = totalDocHeight;
    }
  },

  getOffset: function(_index){
    return this.offsets[_index];
  }
};
