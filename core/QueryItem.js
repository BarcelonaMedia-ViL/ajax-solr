/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Represents a query item (search term). It consists of a fieldName and a value. .
 *  The queries can be parametrised. 
 *  a parametrised query contains a pattern. the pattern is a formatting string 
 *  used in the following way: 
 * the format string must contain {x} on x being 0, 1, 2, 3, ...
 * then an array of values to replace is given, all {0} is replaced by the 
 * first element in the array, {1} by the second....
 * the parameter only takes effect after doing a set_parameter.  
 *
 * @param properties A map of fields to set. Refer to the list of non-private fields.
 * @class QueryItem
 * @param properties A map of fields to set. Refer to the list of non-private fields.
 * @class QueryItem
 * @author Joan Codina
 */
AjaxSolr.QueryItem = AjaxSolr.Class.extend({    
	/** @lends AjaxSolr.QueryItem.prototype */ 
  /** 
   * the field name.
   * @field 
   * @public
   */
  field : "",  
   
  /** 
   * The value
   * @field 
   * @public
   */
  value : "",  
  /** 
   * Its an AND or an OR, "", means OR, "+" means AND, "-" meas NOT
   * @field 
   * @public
   */ 
  OR_AND : " ", 
  
  /** 
   * if fixed, then it is not deleted when the query is cleaned.
   * is a kind of base filter.
   * @field 
   * @public
   */  
  
  
  fixed:false,
 /** 
   * the parten to use to generate the query
   * @field 
   * @public
   */
   
   pattern:"",
   
   /** 
   * an array with the different values to replace.
   * @field 
   * @public
   */  
   
   parameter: [],
   
   /**
    * Indicates that the query is parametrised by setting the pattern  
    * the params must be set 
    * The pattern may be for example [{0} TO {1}] and the param [100,200]
    * the query will be [100 to 200]
    *  
    * @param pattern to be used
    * @param param the parameters to replace in the pattern  
    */
   
   setParametetrized: function (pattern,param){
		this.pattern=pattern
		this.setParameter(param);
   },

/**
 * Sets the value of the query by 
 * replacing each {x} element in the pattern by the corresponding
 * parameter. 
 */

setParameter: function (param){
     this.parameter=param;
     var formated=this.pattern;
     for (val in param){
        formated = formated.replace(new RegExp("\\{" + val + "\\}","g"), param[val]);
     }
     this.value=formated;
},

  /**
   * creates a lucene query syntax, eg pet:"Cats"
   * this fuction prepares the string to avoid the treatment of strange characters in the url
   * 
   */  

  toSolrQuery: function() {
	   var query;
       if (this.OR_AND == null) {this.OR_AND =='+';}
       if (this.field!="")  {   
             query=escape(AjaxSolr.Parameter.escapeValue(this.value));
             query=query.replace(/\+/g,'%2B');
			return  encodeURIComponent(this.OR_AND + this.field + ":") +query;
		}
		else {
             query=escape(this.value);
             query=query.replace(/\+/g,'%2B');
			return  encodeURIComponent(this.OR_AND + "(") + query + ")";
		}
   },
  
   /**
    * creates a lucene query syntax, eg pet:"Cats"
    * This fuction prepares the string to be shown to the user ?? .
    */    
  BasicSolrQuery: function() {
      if (this.OR_AND == null) {this.OR_AND =='+';}      
	  if (this.field!="")  {   
			return    this.field + ":" + this.value ;
 		}
		else {
			return  this.value ;
		}
 },

 /**
  * sets the And/OR/NOT status of the query term
  * 
  * @return And/or/not status
  */  
 SetAndOrNot: function(value) {
        var old= this.OR_AND;
		if (value=="+") {this.OR_AND ='+';}   
        else if (value=="-") {this.OR_AND ='-';}                
        else if (value==" ") {this.OR_AND =' ';}                
        else return false;
        return (old == this.OR_AND) ;  
  },  
  
 /**
  * returns the And/OR/NOT status of the query term
  * @ param {bool} raw if set and true, then return + - or " " else return AND OR NOT
  * @return And/or/not status
  */  
 GetAndOrNot: function(raw) {
		if (this.OR_AND == null) {this.OR_AND =' ';}
		if (raw==true) return this.OR_AND;
        if (this.OR_AND == '+') { return "AND";}                
 		else if  (this.OR_AND == "-"){ return "NOT";}
                else {return "OR"; }
  },  
  
  /**
   * returns the And/OR/NOT status of the query term
   * 
   * @return And/or/not status
   */  
    ChangeAndOrNot: function() {                  
	  if (this.OR_AND == null || this.OR_AND == " ") {this.OR_AND ="+";}
      else if  (this.OR_AND == "+"){this.OR_AND ="-";}
      else {this.OR_AND =" ";}
 },  

  /**
   * Uses fieldName and value to compare items.
   */
  equals: function(obj1, obj2) {
  	if (obj1.field == obj2.field && obj1.value == obj2.value) {
  		return true;
  	}
  	return false;
  }
    
});
