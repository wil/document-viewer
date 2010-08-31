DV.Api = function(app) {
  this.app = app;
};

// Set up the API class.
DV.Api.prototype = {

  // Return the current page of the document.
  currentPage : function() {
    return this.app.models.document.currentPage();
  },

  // Return the page number for one of the three physical page DOM elements, by id:
  getPageNumberForId : function(id) {
    var page = this.app.pageSet.pages[id];
    return page.index + 1;
  },

  // Return the current zoom factor of the document.
  currentZoom : function() {
    var doc = this.app.models.document;
    return doc.zoomLevel / doc.ZOOM_RANGES[1];
  },

  // Return the total number of pages in the document.
  numberOfPages : function() {
    return this.app.models.document.totalPages;
  },

  // Change the documents' sections, re-rendering the navigation. "sections"
  // should be an array of sections in the canonical format:
  // {title: "Chapter 1", pages: "1-12"}
  setSections : function(sections) {
    DV.Schema.data.sections = sections;
    this.app.models.chapters.loadChapters();
    this.redraw();
  },

  // Get a list of every section in the document.
  getSections : function() {
    return _.clone(DV.Schema.data.sections || []);
  },

  // Get the document's description.
  getDescription : function() {
    return DV.Schema.document.description;
  },

  // Set the document's description and update the sidebar.
  setDescription : function(desc) {
    DV.Schema.document.description = desc;
    $j('.DV-description').remove();
    $j('.DV-navigation').prepend(JST.descriptionContainer({description: desc}));
    this.app.helpers.displayNavigation();
  },

  // Get the document's related article url.
  getRelatedArticle : function() {
    return DV.Schema.document.resources.related_article;
  },

  // Set the document's related article url.
  setRelatedArticle : function(url) {
    DV.Schema.document.resources.related_article = url;
    $j('.DV-storyLink a').attr({href : url});
    $j('.DV-storyLink').toggle(!!url);
  },

  // Get the document's title.
  getTitle : function() {
    return DV.Schema.document.title;
  },

  // Set the document's title.
  setTitle : function(title) {
    DV.Schema.document.title = title;
    document.title = title;
  },

  // Set the page text for the given page of a document in the local cache.
  setPageText : function(text, pageNumber) {
    DV.Schema.text[pageNumber - 1] = text;
  },

  // Redraw the UI. Call redraw(true) to also redraw annotations and pages.
  redraw : function(redrawAll) {
    if (redrawAll) {
      this.app.models.annotations.renderAnnotations();
      this.app.models.document.computeOffsets();
    }
    this.app.helpers.renderNavigation();
    this.app.helpers.renderComponents();
    if (redrawAll) {
      this.app.elements.window.removeClass('DV-coverVisible');
      this.app.pageSet.buildPages({noNotes : true});
      this.app.pageSet.reflowPages();
    }
  },

  // Add a new annotation to the document, prefilled to any extent.
  addAnnotation : function(anno) {
    anno = DV.Schema.loadAnnotation(anno);
    this.app.models.annotations.sortAnnotations();
    this.redraw(true);
    this.app.pageSet.showAnnotation(anno, {active: true, noJump : false, edit : true});
    return anno;
  },

  // Register a callback for when an annotation is saved.
  onAnnotationSave : function(callback) {
    this.app.models.annotations.saveCallbacks.push(callback);
  },

  // Register a callback for when an annotation is deleted.
  onAnnotationDelete : function(callback) {
    this.app.models.annotations.deleteCallbacks.push(callback);
  },

  // Request the loading of an external JS file.
  loadJS : function(url, callback) {
    $j.getScript(url, callback);
  }

};
