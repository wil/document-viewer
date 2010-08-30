window.$j = jQuery.noConflict();
window.DV = window.DV || {};

DV.register = function(_name, _instance) {
  if(!window.DV[_name]){
    window.DV[_name] = _instance;
  }
};
