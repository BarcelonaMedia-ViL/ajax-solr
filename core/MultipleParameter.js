// $Id$

/**
 * Represents a Solr parameter.
 *
 * @param properties A map of fields to set. Refer to the list of public fields.
 * @class Parameter
 */
AjaxSolr.MultipleParameter = AjaxSolr.Parameter.extend({
 
  /**
   * The parameter's value, is an array.
   *
   * @field
   * @private
   * @type String
   */
  value: [],

  /**
   * Returns the value. If called with an argument, adds the value.
   *
   * @param {String|Number|String[]|Number[]} [value] The value to set.
   * @returns The value.
   */
  val: function (value) {
    if (value === undefined) {
      
        var values = [];
        for (var i = 0, l = this.value.length; i < l; i++) {
          values.push(this.value[i]);
        }
        return values;
    }
    else {
      this.value = value;
    }
  },


  /**
   * Adds the parameter to the list of values
   * .
   *
   * @param value is a Parameter 
   * @returns false when the value already exists .
   */
  add: function (param) {
    if (param.value === undefined) {
    	this.value=[];
    	return true;
    } else {
        if (AjaxSolr.inArray(param.value,this.values)  == -1) {
            this.value.push(param.value); 
            return true;
            }
		return false;
    }
  },
  
  /**
   * Deletes a parameter.
   *
   * @param {Number} [index] The index of the parameter.
   * @return  true when the parameter is empty
   **/
  removeAll: function (index) {
     if (index===undefined){
       this.value=[];
       this.locals=[];   
     } else {
      this.value.splice(index, 1);
     }
      return (this.value.length == 0);
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
          if (AjaxSolr.equals(this.value[i], value)) {
            indices.push(i);
          }
        }
        return indices.length ? indices : false;
  }, 
  
  /**
   * Returns the Solr parameter as a query string key-value pair.
   *
   * <p>IE6 calls the default toString() if you write <tt>store.toString()
   * </tt>. So, we need to choose another name for toString().</p>
   */
  string: function () {
    var params=[];
	var pairs = [];

    for (var name in this.locals) {
      if (this.locals[name]) {
        pairs.push(name + '=' + encodeURIComponent(this.locals[name]));
      }
    }
 
    var prefix = pairs.length ? '{!' + pairs.join('%20') + '}' : '';
   
    for (var j = 0, m = this.value.length; j < m; j++) {
        params.push(this.name + '=' + prefix + this.value[j]);
      }   
    if  (this.value.length==0) return null;
    return params;
  },
  
  /**
   * Parses a string formed by calling string().
   *
   * @param {String} str The string to parse.
   */
  parseString: function (str) {
    var param = str.match(/^([^=]+)=(?:\{!([^\}]*)\})?(.*)$/);
    if (param) {
      var matches;

      while (matches = /([^\s=]+)=(\S*)/g.exec(decodeURIComponent(param[2]))) {
        this.locals[matches[1]] = decodeURIComponent(matches[2]);
        param[2] = param[2].replace(matches[0], ''); // Safari's exec seems not to do this on its own
      }

      if (param[1] == 'q.alt') {
        this.name = 'q';
        // if q.alt is present, assume it is because q was empty, as above
      }
      else {
        this.name = param[1];
        this.value = this.parseValueString(param[3]);
      }
    }
  },

  /**
   * Returns the value as a URL-encoded string.
   *
   * @private
   * @param {String|Number|String[]|Number[]} value The value.
   * @returns {String} The URL-encoded string.
   */
  valueString: function (value) {
    value = value.join(',');
    return encodeURIComponent(value);
  },

  /**
   * Parses a URL-encoded string to return the value.
   *
   * @private
   * @param {String} str The URL-encoded string.
   * @returns {Array} The value.
   */
  parseValueString: function (str) {
    str = decodeURIComponent(str);
    return str.indexOf(',') == -1 ? str : str.split(',');
  }
});
