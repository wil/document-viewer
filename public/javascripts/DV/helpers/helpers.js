DV.Schema.helpers = {

    HOST_EXTRACTOR : (/https?:\/\/([^\/]+)\//),
    annotationClassName: '.DV-annotation',

    // Bind all events for the docviewer
    // live/delegate are the preferred methods of event attachment
    bindEvents: function(context){
      var boundZoom = this.events.compile('zoom');
      var doc = context.models.document;
      var value = _.indexOf(doc.ZOOM_RANGES, doc.zoomLevel) * 24.7;
      this.application.slider = $j('.DV-zoomBox').slider({
        step: 24.7,
        value: value,
        slide: function(el,d){
          boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value / 24.7, 10)]);
        },
        change: function(el,d){
          boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value / 24.7, 10)]);
        }
      });

      // next/previous
      var history         = this.application.history;
      var compiled        = this.application.compiled;
      compiled.next       = this.events.compile('next');
      compiled.previous   = this.events.compile('previous');


      var states = context.states;
      $j('.DV-navControls').delegate('span.DV-next','click', compiled.next);
      $j('.DV-navControls').delegate('span.DV-previous','click', compiled.previous);

      $j('.DV-annotationView').delegate('.DV-trigger','click',function(e){
        e.preventDefault();
        context.open('ViewAnnotation');
      });
      $j('.DV-documentView').delegate('.DV-trigger','click',function(e){
        history.save('document/p'+context.models.document.currentPage());
        context.open('ViewDocument');
      });
      $j('.DV-textView').delegate('.DV-trigger','click',function(e){

        history.save('text/p'+context.models.document.currentPage());
        context.open('ViewText');
      });
      $j('.DV-allAnnotations').delegate('.DV-annotationGoto .DV-trigger','click', $j.proxy(this.gotoPage, this));

      $j('form.DV-searchDocument').submit(this.events.compile('search'));
      $j('.DV-searchBar').delegate('.DV-closeSearch','click',function(e){
        e.preventDefault();
        history.save('text/p'+context.models.document.currentPage());
        context.open('ViewText');
      });
      $j('.DV-searchBox').delegate('.DV-searchInput-cancel', 'click', $j.proxy(this.clearSearch, this));

      $j('.DV-searchResults').delegate('span.DV-resultPrevious','click', $j.proxy(this.highlightPreviousMatch, this));

      $j('.DV-searchResults').delegate('span.DV-resultNext','click', $j.proxy(this.highlightNextMatch, this));

      // Prevent navigation elements from being selectable when clicked.
      $j('.DV-trigger').bind('selectstart', function(){ return false; });

      var boundToggle           = $j.proxy(this.annotationBridgeToggle, this);
      var collection            = this.elements.collection;

      collection.delegate('.DV-annotationTab','click', boundToggle);
      collection.delegate('.DV-annotationRegion','click', $j.proxy(this.annotationBridgeShow, this));
      collection.delegate('.DV-annotationNext','click', $j.proxy(this.annotationBridgeNext, this));
      collection.delegate('.DV-annotationPrevious','click', $j.proxy(this.annotationBridgePrevious, this));
      collection.delegate('.DV-showEdit','click', $j.proxy(this.showAnnotationEdit, this));
      collection.delegate('.DV-cancelEdit','click', $j.proxy(this.cancelAnnotationEdit, this));
      collection.delegate('.DV-saveAnnotation','click', $j.proxy(this.saveAnnotation, this));
      collection.delegate('.DV-deleteAnnotation','click', $j.proxy(this.deleteAnnotation, this));

      $j('.DV-descriptionToggle').live('click',function(e){
        e.preventDefault();
        e.stopPropagation();

        $j('.DV-descriptionText').slideToggle(300,function(){
          $j('.DV-descriptionToggle').toggleClass('DV-showDescription');
        });
      });

      var cleanUp = $j.proxy(this.application.pageSet.cleanUp, this);

      this.elements.window.live('mousedown',
        function(e){
          var el = $j(e.target);
          if (el.parents().is('.DV-annotation') || el.is('.DV-annotation')) return true;
          if(context.elements.window.hasClass('DV-coverVisible')){
            if((el.width() - parseInt(e.clientX,10)) >= 15){
              cleanUp();
            }
          }
        }
      );

      if(jQuery.browser.msie == true){
        this.elements.browserDocument.bind('focus',$j.proxy(this.focusWindow,this));
        this.elements.browserDocument.bind('focusout',$j.proxy(this.focusOut,this));
      }else{
        this.elements.browserWindow.bind('focus',$j.proxy(this.focusWindow,this));
        this.elements.browserWindow.bind('blur',$j.proxy(this.blurWindow,this));
      }

      // When the document is scrolled, even in the background, resume polling.
      this.elements.window.bind('scroll', $j.proxy(this.focusWindow, this));

      this.elements.coverPages.live('mousedown', cleanUp);

      this.application.acceptInput = this.elements.currentPage.acceptInput({ changeCallBack: $j.proxy(this.acceptInputCallBack,this) });

    },

    startCheckTimer: function(){
      var _t = this.application;
      var _check = function(){
        _t.events.check();
      };
      this.application.checkTimer = setInterval(_check,100);
    },

    stopCheckTimer: function(){
      clearTimeout(this.application.checkTimer);
    },

    blurWindow: function(){
      if(this.application.isFocus === true){
        this.application.isFocus = false;
        // pause draw timer
        this.stopCheckTimer();
      }else{
        return;
      }
    },

    focusOut: function(){
      if(this.application.activeElement != document.activeElement){
        this.application.activeElement = document.activeElement;
        this.application.isFocus = true;
      }else{
        // pause draw timer
        this.application.isFocus = false;
        this.application.helpers.stopCheckTimer();
        return;
      }
    },

    focusWindow: function(){
      if(this.application.isFocus === true){
        return;
      }else{
        this.application.isFocus = true;
        // restart draw timer
        this.startCheckTimer();
      }
    },

    setDocHeight:   function(height,diff) {
      this.elements.window[0].scrollTop += diff;
      this.elements.bar.css('height', height);
    },

    getWindowDimensions: function(){
      var d = {
        height: window.innerHeight ? window.innerHeight : this.elements.browserWindow.height(),
        width: this.elements.browserWindow.width()
      };
      return d;
    },

    // Is the given URL on a remote domain?
    isCrossDomain : function(url) {
      var match = url.match(this.HOST_EXTRACTOR);
      return match && (match[1] != window.location.host);
    },

    resetScrollState: function(){
      this.elements.window.scrollTop(0);
    },

    gotoPage: function(e){
      e.preventDefault();
      var aid           = $j(e.target).parents('.DV-annotation').attr('rel').replace('aid-','');
      var annotation    = this.models.annotations.getAnnotation(aid);
      var application   = this.application;

      if(application.state !== 'ViewDocument'){
        this.models.document.setPageIndex(annotation.index);
        application.open('ViewDocument');
        this.application.history.save('document/p'+(parseInt(annotation.index,10)+1));
      }
    },

    // Determine the correct DOM page ordering for a given page index.
    sortPages : function(pageIndex) {
      if (pageIndex == 0 || pageIndex % 3 == 1) return ['p0', 'p1', 'p2'];
      if (pageIndex % 3 == 2)                   return ['p1', 'p2', 'p0'];
      if (pageIndex % 3 == 0)                   return ['p2', 'p0', 'p1'];
    },

    addObserver: function(observerName){
      this.removeObserver(observerName);
      this.application.observers.push(observerName);
    },

    removeObserver: function(observerName){
      var observers = this.application.observers;
      for(var i = 0,len=observers.length;i<len;i++){
        if(observerName === observers[i]){
          observers.splice(i,1);
        }
      }
    },

    setWindowSize: function(windowDimensions){
        var application     = this.application;
        var elements        = this.elements;
        var headerHeight    = elements.header.outerHeight() + 15;
        var offset          = $j(this.application.options.container).offset().top;
        var uiHeight        = Math.round((windowDimensions.height) - headerHeight - offset);

        // doc window
        elements.window.css({ height: uiHeight, width: windowDimensions.width-267 });

        // well
        elements.well.css( { height: uiHeight });

        // store this for later
        application.windowDimensions = windowDimensions;
        // this.setWindowSize.fired = true;
    },

    toggleContent: function(toggleClassName){
      this.elements.viewer.removeClass('DV-viewText DV-viewSearch DV-viewDocument DV-viewAnnotations').addClass('DV-'+toggleClassName);
    },

    jump: function(pageIndex, modifier,forceRedraw){
      modifier = (modifier) ? parseInt(modifier, 10) : 0;
      var position = this.models.document.getOffset(parseInt(pageIndex, 10))+modifier;
      this.elements.window.scrollTop(position);
      this.models.document.setPageIndex(pageIndex);
      if (forceRedraw) this.application.pageSet.redraw(true);
    },

    shift: function(argHash){
      var windowEl        = this.elements.window;
      var scrollTopShift  = windowEl.scrollTop() + argHash.delta;

      windowEl.scrollTop(scrollTopShift);
    },

    getAppState: function(){
      var docModel = this.models.document;
      var currentPage = (docModel.currentIndex() == 0) ? 1 : docModel.currentPage();

      return { page: currentPage, zoom: docModel.zoomLevel, view: this.application.state };
    },

    constructPages: function(){
      var pages = [];
      var totalPagesToCreate = (this.application.schema.data.totalPages < 3) ? this.application.schema.data.totalPages : 3;

      var height = this.models.pages.height;
      for (var i = 0; i < totalPagesToCreate; i++) {
        pages.push(JST.pages({ pageNumber: i+1, pageIndex: i , pageImageSource: '', baseHeight: height }));
      }

      return pages.join('');
    },

    // Position the viewer on the page. For a full screen viewer, this means
    // absolute from the current y offset to the bottom of the viewport.
    positionViewer : function() {
      var offset = this.elements.viewer.position();
      this.elements.viewer.css({position: 'absolute', top: offset.top, bottom: 0, left: offset.left, right: offset.left});
    },

    unsupportedBrowser : function() {
      if (!($j.browser.msie && $j.browser.version <= "6.0")) return false;
      $j(this.application.options.container).html(JST.unsupported({viewer : this.application}));
      return true;
    },

    registerHashChangeEvents: function(){
      var events  = this.events;
      var history = this.application.history;

      // Default route
      history.defaultCallback = $j.proxy(events.handleHashChangeDefault,this.events);

      // Handle page loading
      history.register(/document\/p(\d*)$/,$j.proxy(events.handleHashChangeViewDocumentPage,this.events));
      // Legacy NYT stuff
      history.register(/p(\d*)$/,$j.proxy(events.handleHashChangeLegacyViewDocumentPage,this.events));
      history.register(/p=(\d*)$/,$j.proxy(events.handleHashChangeLegacyViewDocumentPage,this.events));

      // Handle annotation loading in document view
      history.register(/document\/p(\d*)\/a(\d*)$/, $j.proxy(events.handleHashChangeViewDocumentAnnotation,this.events));

      // Handle annotation loading in annotation view
      history.register(/annotation\/a(\d*)$/,$j.proxy(events.handleHashChangeViewAnnotationAnnotation,this.events));

      // Handle page loading in text view
      history.register(/text\/p(\d*)$/,$j.proxy(events.handleHashChangeViewText,this.events));

      // Handle entity display requests.
      history.register(/entity\/p(\d*)\/(.*)\/(\d+):(\d+)$/,$j.proxy(events.handleHashChangeViewEntity,this.events));

      // Handle search requests
      history.register(/search\/p(\d*)\/(.*)$/,$j.proxy(events.handleHashChangeViewSearchRequest,this.events));
    },

    // Sets up the zoom slider to match the appropriate for the specified
    // initial zoom level, and real document page sizes.
    autoZoomPage: function() {
      var windowWidth = this.elements.window.outerWidth(true);
      var zoom;
      if (this.application.options.zoom == 'auto') {
        zoom = windowWidth - (this.application.models.pages.REDUCED_PADDING * 2);
      } else {
        zoom = this.application.options.zoom;
      }

      // Setup ranges for auto-width zooming
      var ranges = [];
      if (zoom <= 500) {
        var zoom2 = (zoom + 700) / 2;
        ranges = [zoom, zoom2, 700, 850, 1000];
      } else if (zoom <= 750) {
        var zoom2 = ((1000 - 700) / 3) + zoom;
        var zoom3 = ((1000 - 700) / 3)*2 + zoom;
        ranges = [.66*zoom, zoom, zoom2, zoom3, 1000];
      } else if (750 < zoom && zoom <= 850){
        var zoom2 = ((1000 - zoom) / 2) + zoom;
        ranges = [.66*zoom, 700, zoom, zoom2, 1000];
      } else if (850 < zoom && zoom < 1000){
        var zoom2 = ((zoom - 700) / 2) + 700;
        ranges = [.66*zoom, 700, zoom2, zoom, 1000];
      } else if (zoom >= 1000) {
        zoom = 1000;
        ranges = this.application.models.document.ZOOM_RANGES;
      }
      this.application.models.document.ZOOM_RANGES = ranges;
      this.application.slider.slider({'value': parseInt(_.indexOf(ranges, zoom) * 24.7, 10)});
      this.events.zoom(zoom);
    },

    handleInitialState: function(){
      var initialRouteMatch = this.application.history.loadURL(true);
      if(!initialRouteMatch) this.application.open('ViewDocument');
    }

};
