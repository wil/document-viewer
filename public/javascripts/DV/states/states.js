DV.Schema.states = {

  InitialLoad: {
    InitialLoad: function(){
      // If we're in an unsupported browser ... bail.
      if (this.helpers.unsupportedBrowser()) return;

      // Insert the Document Viewer HTML into the DOM.
      this.helpers.renderViewer();

      // Assign element references.
      this.events.elements = this.helpers.elements = this.elements = new DV.Elements(this.pendingElements);

      // Build the data models
      this.models.document.init();
      this.models.pages.init();
      this.models.chapters.init();
      this.models.annotations.init();

      // Render included components, and hide unused portions of the UI.
      this.helpers.renderComponents();

      // Render chapters and notes navigation:
      this.helpers.renderNavigation();

      // Instantiate pageset and build accordingly
      this.pageSet = new DV.pageSet(this);
      this.pageSet.buildPages();

      // BindEvents
      this.helpers.bindEvents(this);

      this.helpers.positionViewer();
      this.models.document.computeOffsets();
      this.helpers.addObserver('drawPages');
      this.helpers.registerHashChangeEvents();
      this.dragReporter = new DV.dragReporter('.DV-pageCollection',$j.proxy(this.helpers.shift, this), { ignoreSelector: '.DV-annotationRegion,.DV-annotationContent' });
      this.helpers.startCheckTimer();
      this.helpers.handleInitialState();
      this.helpers.autoZoomPage();
    }
  }
};
