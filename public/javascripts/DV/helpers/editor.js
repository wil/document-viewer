_.extend(DV.Schema.helpers,{
  showAnnotationEdit : function(e) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var area   = this.viewer.$('.DV-annotationTextArea', annoEl);
    var height = this.viewer.$('.DV-annotationBody', annoEl).height();
    area.css({height : Math.max(height - 65, 75)}); // 65 being the fudge difference...
    annoEl.addClass('DV-editing');
    area.focus();
  },
  cancelAnnotationEdit : function(e) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    this.viewer.$('.DV-annotationTitleInput', annoEl).val(anno.title);
    this.viewer.$('.DV-annotationTextArea', annoEl).val(anno.text);
    if (anno.unsaved) {
      this.models.annotations.removeAnnotation(anno);
    } else {
      annoEl.removeClass('DV-editing');
    }
  },
  saveAnnotation : function(e, option) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    var $access = this.viewer.$('.DV-annotationAccessSelect :selected', annoEl);
    if (!anno) return;
    anno.title  = this.viewer.$('.DV-annotationTitleInput', annoEl).val();
    anno.text   = this.viewer.$('.DV-annotationTextArea', annoEl).val();
    if ($access.length) anno.access = $access.val();
    if (option == 'onlyIfText' && 
        (!anno.title || anno.title == 'Untitled Note') && 
        !anno.text && 
        !anno.server_id) {
      return this.models.annotations.removeAnnotation(anno);
    }
    this.models.annotations.refreshAnnotation(anno);
    annoEl.removeClass('DV-editing');
    this.viewer.api.redraw();
    this.models.annotations.fireSaveCallbacks(anno);
  },
  deleteAnnotation : function(e) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    this.models.annotations.removeAnnotation(anno);
    this.models.annotations.fireDeleteCallbacks(anno);
  }
});