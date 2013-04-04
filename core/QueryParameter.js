// $Id$

/**
 * Represents a Solr query or fq  parameter.
 * 
 * A query (or fq) parameter is build of many conditions. it could be seen as a query tree. but
 * for simplification is only a set pf query terms that may be optional (OR), mandatory (AND +) or 
 * negated (NOT - ) 
 * Each query is composed by a field and a condition, the set may not be present, this can be because 
 * it uses the default search field or because is a complex query like (+(a b) +c)
 * There are methods, to add, change, and generate the queries
 *
 * @param the query parmeter.
 * @class QueryParameter
 * @author Joan Codina
 */
AjaxSolr.QueryParameter = AjaxSolr.MultipleParameter.extend(
  /** @lends AjaxSolr.Parameter.prototype */
  {
  /**
   * The parameter's name. it can be fq or q
   *
   * @field
   * @private
   * @type String
   */
  name: 'q',

  /** 
   * A collection of the currently selected QueryItems. For internal use only. 
   * @field 
   * @private 
   */
  value : [],

  /** 
   * Adds the given item to the current set of items.
   * @param widgetId The widgetId of where these items were selected. 
   * @param items A list of newly selected items. 
   * @param request, if a request must be performed just after performing the changes.  
   *
   */

  addItem: function(field, value,fixed,boolVal){
      if (boolVal===undefined) boolVal=" ";
      var item =new AjaxSolr.QueryItem({field:field,value:value,fixed:fixed,OR_AND :boolVal});
	  if (!this.containsItem(item)) {
        this.value.push(item);
        return true;
      }
      return false;
  },
  /**
   * Deletes a parameter if not fixed.
   *
   * @param {Number} [index] The index of the parameter.
   * @return  true when the parameter is empty
   **/
  removeAll: function (index) {
     if (index===undefined){
      for (var j = this.value.length-1 ; j >=0; j--) {
        if (!this.value[j].fixed){
    		  this.value.splice(j, 1);
    	  }  
      }       
     } else {
      this.value.splice(index, 1);
     }
      return (this.value.length == 0);
  }, 
   
  /** 
   * Removes the given item from the current selection
   * 
   *  @param sorlQuery, the item is given as a query
   */  
  deselectItem: function(solrQuery){
     for (var j = this.value.length-1 ; j >=0; j--) {
       if (!this.value[j].fixed){
    	  var s = this.value[j].toSolrQuery();
    	  if (s ==  solrQuery) {
    		  this.value.splice(j, 1);
    		  return true;
    	  }  
      } 
    }
    return false; // (no element was deleted)
 },
 
 
  /** 
   * Joan Codina,
   * Changes the given item from or to and or not.
   *
   * @param {sring} solrQuery the query to be changed.
   * @param {sring} newBool the new bool value, must be " ", "+" or "-" 
   */  
  changeItem: function(solrQuery,newBool){
     var changed=false;
     for (var j = 0; j < this.value.length; j++) {
    	var s = this.value[j].toSolrQuery();
      	if (s ==  solrQuery) {
      	  if (newBool === undefined){
      	  changed=true;
          this.value[j].ChangeAndOrNot();
          }else { 
             changed= (changed || this.value[j].SetAndOrNot(newBool) );
          }
      	}
      }
      return changed;
   }, 
   
  /**
   * Finds all parameters with matching values.
   *
   * @param {String|Number|String[]|Number[]|RegExp} value The value.
   * @returns {String|Number[]} The indices of the parameters found.
   */
  find: function (name,value) {
        var indices = [];
        for (var i = 0, l = this.value.length; i < l; i++) {
          if (AjaxSolr.equals(this.value[i].toSolrQuery(), value)) {
            indices.push(i);
          }
        }
        return indices.length ? indices : false;
  }, 
   
  /** 
   * Checks if the given item is available in the current selection.
   * @param {jQuery.solrjs.QueryItem} item The item to check.
   */  
  containsItem: function(item){
  	for (var i = 0; i < this.value.length; ++i) {
  		if (this.value[i].toSolrQuery() == item.toSolrQuery()) {
  			return true;
  		}		
  	}
  	return false;
  },
  
  /**
   * Returns the value. If called with an argument, sets the value.
   *
   * @param {String|Number|String[]|Number[]} [value] The value to set.
   * @returns The value.
   */
  val: function (value) {
    if (value === undefined) {
      return this.value;
    }
    else {
      this.value = value;
    }
  },



  /**
   * Returns all the items in the quey as a single string
   */
  string: function () {
    var pairs = [];

    for (var name in this.locals) {
      if (this.locals[name]) {
        pairs.push(name + '=' + encodeURIComponent(this.locals[name]));
      }
    }
    var prefix = pairs.length ? '{!' + pairs.join('%20') + '}' : '';
    
    if (this.value.length>0) { 
            var result;
            result=this.name + '=' + prefix;	
        	for (var i = 0; i < this.value.length; ++i) {
        	   result += "+"+this.value[i].toSolrQuery();
        	}
           return result ;
    }
    // For dismax request handlers, if the q parameter has local params, the
    // q parameter must be set to a non-empty value. In case the q parameter
    // has local params but is empty, use the q.alt parameter, which accepts
    // wildcards.
    else if (prefix) {
      return this.name +'.alt=' + prefix + encodeURIComponent('*:*');
    }
    else {
      return this.name +'='+ encodeURIComponent('*:*');
    }
  },


  /**
   * Returns all the items in the quey as a single string without the "q="
   */
  qString: function () {
    var pairs = [];

    for (var name in this.locals) {
      if (this.locals[name]) {
        pairs.push(name + '=' + encodeURIComponent(this.locals[name]));
      }
    }
    var prefix = pairs.length ? '{!' + pairs.join('%20') + '}' : '';
    
    if (this.value.length>0) { 
            var result;
            result=prefix;	
        	for (var i = 0; i < this.value.length; ++i) {
        	   var query = this.value[i].GetAndOrNot(true)+this.value[i].BasicSolrQuery();
        	   result += " "+query.replace(/\+/g,'%2B');
        	}
           return result ;
    }
    // For dismax request handlers, if the q parameter has local params, the
    // q parameter must be set to a non-empty value. In case the q parameter
    // has local params but is empty, use the q.alt parameter, which accepts
    // wildcards.
    else if (prefix) {
      return  prefix + '*:*';
    }
    else {
      return '*:*';
    }
  }

});
