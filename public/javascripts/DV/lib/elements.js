DV.Elements = function(elements){
  if(!elements){
    throw('Elements to query must be defined');
    return;
  }
  this.names = [];

  if(elements.constructor === Array){
    return this.getElements(elements);
  }else{
    return this.getElement(elements);
  }
};

// Get and store an element reference
DV.Elements.prototype.getElement = function(elementQuery,force){
  if(this[elementQuery.name] && force === null){
    return;
  }else{
    this[elementQuery.name] = jQuery(elementQuery.query, DV.container);
    this.names.push(elementQuery.name);
    return this;
  }
};

// Get a collection of elements
DV.Elements.prototype.getElements = function(querySet,force){
  for (var i = querySet.length - 1; i >= 0; i--){
    this.getElement(querySet[i],force);
  };
  return this;
};
