// $Id$

/**
 * Represents a Solr parameter.
 *
 * @param properties A map of fields to set. Refer to the list of public fields.
 * @class Parameter
 */
AjaxSolr.Parameter = AjaxSolr.Class.extend(
  /** @lends AjaxSolr.Parameter.prototype */
  {
  /**
   * The parameter's name.
   *
   * @field
   * @private
   * @type String
   */
  name: null,

  /**
   * The parameter's value.
   *
   * @field
   * @private
   * @type String
   */
  value: null,

  /**
   * The parameter's local parameters.
   *
   * @field
   * @private
   * @type Object
   * @default {}
   */
  locals: {},

  /**
   * Returns the value. If called with an argument, sets the value.
   *
   * @param {String|Number|String[]|Number[]} [value] The value to set.
   * @returns The value.
   */
  val: function (value) {
    if (value === undefined) {
      return [ this.value ] ;
    }
    else {
      this.value = value;
    }
  },

  /**
   * replaces de parameter
   * .
   *
   * @param value is a Parameter 
   * @returns false when the value already exists .
   */
  add: function (param) {
    if (param.value === undefined) {
    	this.value=null;
    	return true;
    } else {
    	this.value=param.value;
		return true;
    }
  }, 
  
  /**
   * Deletes a parameter.
   *
   * @param {String} name The name of the parameter.
   * @param {Number} [index] The index of the parameter.
   * @return true when the parameter is empty
   */
  removeAll: function (index) {
	  this.value=null;
	  this.locals=[];
      return true;
  },
  
  
  /**
   * Finds all parameters with matching values.
   *
   * @param {String|Number|String[]|Number[]|RegExp} value The value.
   * @returns {String|Number[]} The indices of the parameters found.
   */
  find: function (name,value) {
      if (AjaxSolr.equals(this.value, value)) {
          return name;
       }  
  },	  
	  
	  
  /**
   * Returns the value of a local parameter. If called with a second argument,
   * sets the value of a local parameter.
   *
   * @param {String} name The name of the local parameter.
   * @param {String|Number|String[]|Number[]} [value] The value to set.
   * @returns The value.
   */
  local: function (name, value) {
    if (value === undefined) {
      return this.locals[name];
    }
    else {
      var old=this.locals[name];
      this.locals[name] = value;
      return old;
    }
  },

  /**
   * Deletes a local parameter.
   *
   * @param {String} name The name of the local parameter.
   */
  remove: function (name) {
    delete this.locals[name];
  },

  /**
   * Returns the Solr parameter as a query string key-value pair.
   *
   * <p>IE6 calls the default toString() if you write <tt>store.toString()
   * </tt>. So, we need to choose another name for toString().</p>
   */
  string: function () {
    var pairs = [];

    for (var name in this.locals) {
      if (this.locals[name]) {
        pairs.push(name + '=' + encodeURIComponent(this.locals[name]));
      }
    }

    var prefix = pairs.length ? '{!' + pairs.join('%20') + '}' : '';

    if (this.value !== undefined) {
      return [ this.name + '=' + prefix + this.valueString(this.value) ];
    }
    // For dismax request handlers, if the q parameter has local params, the
    // q parameter must be set to a non-empty value. In case the q parameter
    // has local params but is empty, use the q.alt parameter, which accepts
    // wildcards.
    else if (this.name == 'q' && prefix) {
      return 'q.alt=' + prefix + encodeURIComponent('*:*');
    }
    else {
      return '';
    }
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
    value = AjaxSolr.isArray(value) ? value.join(',') : value;
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

/**
 * Escapes a value, to be used in, for example, an fq parameter. Surrounds
 * strings containing spaces or colons in double quotes.
 *
 * @public
 * @param {String|Number} value The value.
 * @returns {String} The escaped value.
 */
AjaxSolr.Parameter.escapeValue = function (value) {
  // If the field value has a space or a colon in it, wrap it in quotes,
  // unless it is a range query or it is already wrapped in quotes.
  if (value.match(/[ :]/) && !value.match(/[\[\{] *\S+ +TO +\S+ *[\]\}]/) && !value.match(/^["\(].*["\)]$/)) {
    return '"' + value + '"';
  }
  return value;
}

AjaxSolr.Parameter.escapeAllValue = function (value) {
  // If the field value has a space or a colon in it, wrap it in quotes,
  // unless it is a range query or it is already wrapped in quotes.
  var newvalue=value.replace(/([\[\]\)\(\:"'+-])/g,"\\$1");
  return  newvalue ;
}
