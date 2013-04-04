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
AjaxSolr.FQParameter= AjaxSolr.QueryParameter.extend(
  /** @lends AjaxSolr.Parameter.prototype */
  {
  /**
   * The parameter's name. it can be fq or q
   *
   * @field
   * @private
   * @type String
   */
  name: 'fq',



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
    var result;
    if (this.value.length>0) { 
    	result=this.name + '=' + prefix;	
    	for (var i = 0; i < this.value.length; ++i) {
    	   result += "+"+this.value[i].toSolrQuery();
    	}
        return result;
    }
    else {
      return null;
    }
  }


});
