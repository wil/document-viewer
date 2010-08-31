DV.Elements = function(viewer){
  this._viewer = viewer;
  _.each(DV.Schema.elements, _.bind(function(el) {
    this.getElement(el);
  }, this));
};

// Get and store an element reference
DV.Elements.prototype.getElement = function(elementQuery,force){
  this[elementQuery.name] = jQuery(elementQuery.query, this._viewer.options.container);
};
