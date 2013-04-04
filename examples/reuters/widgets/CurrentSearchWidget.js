/** 
 * This current Search Widget is more generic,
 * 
 * it adds some extra utilities to allow the use of the AND/OR/NOT operators.
 * @autor Joan Codina
 */

(function ($) {

AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({
   start: 0, 
/**
   * if true it shows the base fixed queries
   * @param 
   */
  viewFixed:false,

  beforeRequest: function () {
    $(this.target).html($('<img/>').attr('src', 'images/ajax-loader.gif'));
  },
  afterRequest: function () {
    var self = this;
   $(this.target).empty();
    var table = $("<table/>").appendTo(this.target);
    var fq = this.manager.store[this.set].values('fq')[0];
    var numElements=0;
    for (var i = 0, l = fq.length; i < l; i++) {
    	 numElements+=self.show(fq[i],table,self,'fq');
    }

    var q = this.manager.store[this.set].values('q')[0];
    for (var i = 0, l = q.length; i < l; i++) {
    	  numElements+=self.show(q[i],table,self,'q');
     }
    
    
    if (numElements > 1) {
        $('<a href="#"/>').text('remove all').click(function () {
        var sets= self.manager.store[self.set].removeByValue('fq');
        var sets2=self.manager.store[self.set].removeByValue('q');
        for (var j=0;j<sets2.length;j++){
            s=sets2[j];
            found=false;
            for (var k=0;k<sets.length;k++){
                if (sets[k]==s){
                    found=true;
                    break;
                }
            }
            if(!found) sets.push(s);
        }
        self.manager.doSetsRequest(sets,0);
        return false;
      }).appendTo(this.target);
    }
    if (numElements == 0) {
      $('<div/>').text('Viewing all documents!').appendTo(this.target);
    }
  },
  
  show:function(item,table,self,q){
          var num=0; 
          if (item.fixed && !self.viewFixed) return 0;
    	  var SelectedItem = $("<tr/>").appendTo(table);
          var column= $("<td/>").appendTo(SelectedItem);
          if (!item.fixed){
          	$('<a href="#" />').text("(x) ").click(self.removeElement(item.toSolrQuery(),q) ) 
          	.appendTo(column);
          	num=1;
          }	
   	      column= $("<td/>").appendTo(SelectedItem);
         if (!item.fixed){
 	        $('<a  href="#" />').text(item.GetAndOrNot()).click(self.changeElement(item.toSolrQuery(),q))
	        .appendTo(column);
          }
	      column= $("<td/>").appendTo(SelectedItem);
          column.append(item.BasicSolrQuery());
          return num;	  
  },
  
  changeElement: function (facet,q) {
		    var self = this;
		    return function () {
		      var sets=self.manager.store[self.set].changeQByValue(q, facet);
		      if (sets!=null) {
                  self.manager.doSetsRequest(sets,0);
              }  
		      return false;
		    };
		  },	  
	  
  removeElement: function (facet,q) {
	    var self = this;
	    return function () {
	        var sets=self.manager.store[self.set].removeByValue(q, facet);
	        if (sets!=null) {
              self.manager.doSetsRequest(sets,0);
            }  
	        return false;
          };
	  },		  
		  

  removeFacet: function (facet) {
    var self = this;
    return function () {
      var sets=self.manager.store[self.set].removeByValue('fq', facet); 
      if (sets!=null) {
            self.manager.doSetsRequest(sets,0);

      }
      return false;
    };
  }
});

})(jQuery);
