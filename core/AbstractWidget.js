// $Id$

/**
 * Baseclass for all widgets. 
 * 
 * Provides abstract hooks for child classes.
 *
 * @param properties A map of fields to set. May be new or public fields.
 * @class AbstractWidget
 */
AjaxSolr.AbstractWidget = AjaxSolr.Class.extend(
  /** @lends AjaxSolr.AbstractWidget.prototype */
  {
  /** 
   * A unique identifier of this widget.
   *
   * @field 
   * @public
   * @type String
   */
  id: null,

  /** 
   * The CSS selector for this widget's target HTML element, e.g. a specific
   * <tt>div</tt> or <tt>ul</tt>. A Widget is usually implemented to perform
   * all its UI changes relative to its target HTML element.
   * 
   * @field 
   * @public
   * @type String
   */
  target: null,

  /**
   * A reference to the widget's manager. For internal use only.
   *
   * @field
   * @private
   * @type AjaxSolr.AbstractManager
   */
  manager: null,

  /**
   * A reference to the set to which it belongs. For internal use only.
   *
   * @field
   * @private
   * @type integer
   */
  set: 0,
 /**
   * The offset parameter. Set this field to make the widget reset the offset
   * parameter to the given value on each request.
   *
   * @field
   * @public
   * @type Number
   */
  start: undefined,
  /** 
   * This query set indicates to which set the action of the widget is directed, this means that,
   *  for example, in the tagcloudwidget to which set the queries must be added. Sometimes the different
   *  sets are all copies of a base set, and this one must receive all the queries, the value of -1 indicates that 
   *  is the same as the set.
   * 
   * @field
   * @private
   * @type integerr
   */
   querySet: null ,
  /**
   * The Solr servlet for this widget. You may prepend the servlet with a core
   * if using multiple cores. If none is set, it will default to the manager's
   * servlet.
   *
   * @field
   * @public
   * @type String
   */
  servlet: undefined,

  /**
   * An abstract hook for child implementations.
   *
   * <p>This method should do any necessary one-time initializations.</p>
   */
  init: function () {
	     if (this.querySet!=null) {
	    	 this.querySet= this.querySet.split(",");
	     } else {
	    	 this.querySet=[];
	         this.querySet[this.set]=this.set;
	     }
  },

  /** 
   * An abstract hook for child implementations.
   *
   * <p>This method is executed before the Solr request is sent.</p>
   */
  beforeRequest: function () {},

  /**
   * An abstract hook for child implementations.
   *
   * <p>This method is executed after the Solr response is received.</p>
   */
  afterRequest: function () {},

  /**
   * A proxy to the manager's doRequest method.
   *
   * @param {Boolean} [start] The Solr start offset parameter.
   * @param {String} [servlet] The Solr servlet to send the request to.
   */
  doRequest: function (start, servlet) {
    this.manager.doRequest(start || this.start, servlet || this.servlet);
  }
});
