(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
   start: 0,
  TimeOut:null,

  beforeRequest: function () {
    $(this.target).html($('<img/>').attr('src', 'images/ajax-loader.gif'));   
    if (this.TimeOut!=null)   clearTimeout(this.TimedOut) ;
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
    if (facet_values) {
      for (var i = 0, l = facet_values.length; i < l; i++) {
        if (facet_values[i] !== undefined) {
          links.push(AjaxSolr.theme('facet_link', facet_values[i], this.facetHandler(facet_field, facet_values[i])));
        }
        else {
          links.push(AjaxSolr.theme('no_items_found'));
        }
      }
    }
    return links;
  },


  facetLink: function (facet_field, facet_value) {
    var links = [];
    if (facet_value) {
    	var link=AjaxSolr.theme('facet_link', facet_value, this.facetHandler(facet_field, facet_value))
        links.push(link);
      }
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.manager.store[this.set].remove('fq');
      self.manager.store[this.set].addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
      self.manager.doRequest(0);
      return false;
    };
  },

  afterRequest: function () {
    var self=this;
    var delay=function() {self.delayedAfterRequest(self);};
    this.TimedOut=setTimeout(delay,200);
    //this.TimedOut=setTimeout(function(thisObj) {thisObj.delayedAfterRequest(thisObj);} ,200, this);
  },
  delayedAfterRequest: function (self) {
    $(self.target).empty();
    for (var i = 0, l = self.manager.response[self.set].response.docs.length; i < l; i++) {
      var doc = self.manager.response[self.set].response.docs[i];
      AjaxSolr.theme('result', doc,self);
      /* f
      var items = [];
      items = items.concat(this.facetLinks('All_good_comments', doc.All_good_comments));
      // items = items.concat(this.facetLinks('organisations', doc.organisations));
      // items = items.concat(this.facetLinks('exchanges', doc.exchanges));
      AjaxSolr.theme('list_items', '#links_' + doc.id, items);
      */
    }
  },

  init: function () {
    $('a.more').livequery(function () {
      $(this).toggle(function () {
        $(this).parent().find('span').show();
        $(this).text('less');
        return false;
      }, function () {
        $(this).parent().find('span').hide();
        $(this).text('more');
        return false;
      });
    });
  }
});

})(jQuery);
