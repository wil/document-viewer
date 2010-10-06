// The API references it's viewer.
DV.Api = function(viewer) {
  this.viewer = viewer;
};

// Set up the API class.
DV.Api.prototype = {

  // Return the current page of the document.
  currentPage : function() {
    return this.viewer.models.document.currentPage();
  },

  // Return the page number for one of the three physical page DOM elements, by id:
  getPageNumberForId : function(id) {
    var page = this.viewer.pageSet.pages[id];
    return page.index + 1;
  },

  // Get the document's canonical ID.
  getId : function() {
    return this.viewer.schema.document.id;
  },
  
  // Get the document's numerical ID.
  getModelId : function() {
    return parseInt(this.getId(), 10);
  },

  // Return the current zoom factor of the document.
  currentZoom : function() {
    var doc = this.viewer.models.document;
    return doc.zoomLevel / doc.ZOOM_RANGES[1];
  },

  // Return the total number of pages in the document.
  numberOfPages : function() {
    return this.viewer.models.document.totalPages;
  },

  // Return the name of the conributor, if available.
  getContributor : function() {
    return this.viewer.schema.document.contributor;
  },

  // Return the name of the contributing organization, if available.
  getContributorOrganization : function() {
    return this.viewer.schema.document.contributor_organization;
  },

  // Change the documents' sections, re-rendering the navigation. "sections"
  // should be an array of sections in the canonical format:
  // {title: "Chapter 1", pages: "1-12"}
  setSections : function(sections) {
    this.viewer.schema.data.sections = sections;
    this.viewer.models.chapters.loadChapters();
    this.redraw();
  },

  // Get a list of every section in the document.
  getSections : function() {
    return _.clone(this.viewer.schema.data.sections || []);
  },

  // Get the document's description.
  getDescription : function() {
    return this.viewer.schema.document.description;
  },

  // Set the document's description and update the sidebar.
  setDescription : function(desc) {
    this.viewer.schema.document.description = desc;
    this.viewer.$('.DV-description').remove();
    this.viewer.$('.DV-navigation').prepend(JST.descriptionContainer({description: desc}));
    this.viewer.helpers.displayNavigation();
  },

  // Get the document's related article url.
  getRelatedArticle : function() {
    return this.viewer.schema.document.resources.related_article;
  },

  // Set the document's related article url.
  setRelatedArticle : function(url) {
    this.viewer.schema.document.resources.related_article = url;
    this.viewer.$('.DV-storyLink a').attr({href : url});
    this.viewer.$('.DV-storyLink').toggle(!!url);
  },

  // Get the document's title.
  getTitle : function() {
    return this.viewer.schema.document.title;
  },

  // Set the document's title.
  setTitle : function(title) {
    this.viewer.schema.document.title = title;
    document.title = title;
  },

  getPageText : function(pageNumber) {
    return this.viewer.schema.text[pageNumber - 1];
  },
  
  // Set the page text for the given page of a document in the local cache.
  setPageText : function(text, pageNumber) {
    this.viewer.schema.text[pageNumber - 1] = text;
  },
  
  // Reset all modified page text to the original values from the server cache.
  resetPageText : function(overwriteOriginal) {
    var self = this;
    var pageText = this.viewer.schema.text;
    if (overwriteOriginal) {
      this.viewer.models.document.originalPageText = {};
    } else {
      _.each(this.viewer.models.document.originalPageText, function(originalPageText, pageNumber) {
        pageNumber = parseInt(pageNumber, 10);
        if (originalPageText != pageText[pageNumber-1]) {
          self.setPageText(originalPageText, pageNumber);
          if (pageNumber == self.currentPage()) {
            self.viewer.events.loadText();
          }
        }
      });
    }
  },

  // Redraw the UI. Call redraw(true) to also redraw annotations and pages.
  redraw : function(redrawAll) {
    if (redrawAll) {
      this.viewer.models.annotations.renderAnnotations();
      this.viewer.models.document.computeOffsets();
    }
    this.viewer.helpers.renderNavigation();
    this.viewer.helpers.renderComponents();
    if (redrawAll) {
      this.viewer.elements.window.removeClass('DV-coverVisible');
      this.viewer.pageSet.buildPages({noNotes : true});
      this.viewer.pageSet.reflowPages();
    }
  },

  // Add a new annotation to the document, prefilled to any extent.
  addAnnotation : function(anno) {
    anno = this.viewer.schema.loadAnnotation(anno);
    this.viewer.models.annotations.sortAnnotations();
    this.redraw(true);
    this.viewer.pageSet.showAnnotation(anno, {active: true, edit : true});
    return anno;
  },

  // Register a callback for when an annotation is saved.
  onAnnotationSave : function(callback) {
    this.viewer.models.annotations.saveCallbacks.push(callback);
  },

  // Register a callback for when an annotation is deleted.
  onAnnotationDelete : function(callback) {
    this.viewer.models.annotations.deleteCallbacks.push(callback);
  },

  enterRemovePagesMode : function() {
    this.viewer.elements.viewer.addClass('DV-removePages');
  },

  leaveRemovePagesMode : function() {
    this.viewer.elements.viewer.removeClass('DV-removePages');
  },

  resetRemovedPages : function() {
    this.viewer.models.document.resetRemovedPages();
  },

  addPageToRemovedPages : function(page) {
    this.viewer.models.document.addPageToRemovedPages(page);
  },

  removePageFromRemovedPages : function(page) {
    this.viewer.models.document.removePageFromRemovedPages(page);
  },
  
  enterReorderPagesMode : function() {
    this.viewer.elements.viewer.addClass('DV-reorderPages');
  },
  
  leaveReorderPagesMode : function() {
    this.viewer.thumbnails.rerender();
    this.viewer.elements.viewer.removeClass('DV-reorderPages');
  },
  
  resetReorderedPages : function() {
    this.viewer.models.document.resetReorderedPages();
  },
  
  reorderPages : function(pageOrder, options) {
    var model = this.getModelId();
    this.viewer.models.document.reorderPages(model, pageOrder, options);
  },
    
  enterEditPageTextMode : function() {
    this.viewer.elements.viewer.addClass('DV-editingText');
    this.viewer.events.loadText();
  },
  
  leaveEditPageTextMode : function() {
    this.resetPageText();
    this.viewer.elements.viewer.removeClass('DV-editingText');
  },

  // Request the loading of an external JS file.
  loadJS : function(url, callback) {
    DV.jQuery.getScript(url, callback);
  }

};
