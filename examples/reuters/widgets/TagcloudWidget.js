/** 
* Joan Codina
* Some improvements work with multiple sets and differnt sizes...
* Added export data to allow exporting in other formats...
*/

(function ($) {

AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
  /** number of items to display
   *  is necessary as for statistic widgests the number of facets retrived may be much highger
   *  Than the ones to display
   */
  itemsToDisplay:10,
  
  afterRequest: function () {
	this.dataExport="";
    if (this.manager.response[this.set].facet_counts.facet_fields[this.field] === undefined) {
      $(this.target).html(AjaxSolr.theme('no_items_found'));
      return;
    }

    var maxCount = 0;
    var objectedItems = [];
    var items=0;
    for (var facet in this.manager.response[this.set].facet_counts.facet_fields[this.field]) {
      var count = parseInt(this.manager.response[this.set].facet_counts.facet_fields[this.field][facet]);
      if (count > maxCount) {
        maxCount = count;
      }
      objectedItems.push({ facet: facet, count: count });
      items++;
      if (items==this.itemsToDisplay) break;
    }
    objectedItems.sort(function (a, b) {
      return a.facet < b.facet ? -1 : 1;
    });

    $(this.target).empty();
    for (var i = 0, l = objectedItems.length; i < l; i++) {
      var facet = objectedItems[i].facet;
      this.dataExport+='"'+facet+'",'+objectedItems[i].count+"<br>";   
      var elem=$(AjaxSolr.theme('tag', facet+"("+objectedItems[i].count +")" , parseInt(objectedItems[i].count / maxCount * 10), this.clickHandler({value:facet,set:this.set}),this.baseClass));
  	  elem.attr("title", objectedItems[i].count.toFixed(3)+"-- "+parseInt(objectedItems[i].count / maxCount * 10 ));
      $(this.target).append(elem) ;
      $(this.target).append(" ");
    }
  }
});

})(jQuery);
