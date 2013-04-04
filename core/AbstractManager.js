// $Id$

/**
 * The Manager acts as the controller in a Model-View-Controller framework. All
 * public calls should be performed on the manager object.
 * 
 *  Joan Codina:it allows the use of many sets of answers.
 * if no sets are defined a single set is supposed to be exist
 * when multiple sets, there are different kind of widgets
 *  widgets related to a single set, different than set 0, they just work as usual widgets, but opperate on that set
 *  widgests related to set 0 on when multiple sets, these kind of widgets trend to opperate on the different sets or the default set
 * ResultSet Widget (and maybe others) displays the default set,
 * The ResultSet widget allows to change the default set.
 * @param properties A map of fields to set. Refer to the list of public fields.
 * @class AbstractManager
 */
AjaxSolr.AbstractManager = AjaxSolr.Class.extend(
  /** @lends AjaxSolr.AbstractManager.prototype */
  {
  /**
   * The fully-qualified URL of the Solr application. You must include the
   * trailing slash. Do not include the path to any Solr servlet.
   *
   * @field
   * @public
   * @type String
   * @default "http://localhost:8983/solr/"
   */
  solrUrl: 'http://localhost:8983/solr/',

  /**
   * If we want to proxy queries through a script, rather than send queries
   * to Solr directly, set this field to the fully-qualified URL of the script.
   *
   * @field
   * @public
   * @type String
   */
  proxyUrl: null,

  /**
   * The default Solr servlet. You may prepend the servlet with a core if using
   * multiple cores.
   *
   * @field
   * @public
   * @type String
   * @default "select"
   */
  servlet: 'select',

  /**
   * An array of the most recent response from Solr.
   *
   * @field
   * @private
   * @type Object
   * @default {}
   */
  response: [{}],

  /** 
   *  An array of collections of all registered widgets. For internal use only.
   *
   * @field
   * @private
   * @type Object
   * @default {}
   */
  widgets: [{}],

  /**
   * The parameter store for the manager and its widgets. For internal use only.
   *
   * @field
   * @private
   * @type Object
   */
  store: [null],
    /** 
   * A constant representing the number of "sets"
   * @field 
   * @private 
   */
  sets : 1, 
  
  /** 
   * An array to identify the different sets"
   * @field 
   * @private 
   */
  setNames : ["All"],

    /** 
   * The default query for each field"
   * @field 
   * @private 
   */
  queryAll: ["*:*"],  
  /** 
   * list of sets that are awaiting for the completion of the callback
   * @field 
   * @private 
   */     
  pendingSets:[false], 
  /** 
   * Number of fields that are pending for the completion of the callback,
   * when zero all of them are back
   * @field 
   * @private 
   */     
  pending:0,
   /**
   * Whether <tt>init()</tt> has been called yet. For internal use only.
   *
   * @field
   * @private
   * @type Boolean
   * @default false
   */
  initialized: false,

  /**
   * An abstract hook for child implementations.
   *
   * <p>This method should be called after the store and the widgets have been
   * added. It should initialize the widgets and the store, and do any other
   * one-time initializations, e.g., perform the first request to Solr.</p>
   *
   * <p>If no store has been set, it sets the store to the basic <tt>
   * AjaxSolr.ParameterStore</tt>.</p>
   */
  init: function () {
    this.initialized = true;
    for (var set=0;set<this.sets;set++){
        if (this.store[set] === null) {
           this.setStore(new AjaxSolr.ParameterStore(),set);
        } 
        this.store[set].load(false);
     }
     for (var set=0;set<this.sets;set++){
        	 for (var widgetId in this.widgets[set]) {
             this.widgets[set][widgetId].init();
        }
        this.store[set].init();
     }
  },
  /**
  * A function to add sets to the manager, 
  * it must be called before adding any widgets
  * If not used, a single set is defined, and all widgets are assigned to it.
  * @param (setNames)
  */
   addSets:function (setNames){
      this.sets=setNames.length;
      this.setNames=setNames;
      this.queryALL=[];
      this.store=[];
      this.widgets=[];
      this.response=[];
      for (var i=0;i<this.sets;i++){
        this.queryAll[i]="*:*";
        this.store[i]=null;
        this.widgets[i]={};
        this.response[i]={};
      }
   }, 
   /** Joan Codina
   * changes the dataset of a widget. To be used in the resultsets in order to show the selected results.
   * @param {jQuery.solrjs.AbstractWidget} widget An instance of AbstractWidget. 
   * @param {int} set the new set. 
   */
  changeSetWidget : function(widget,set) {

      this.widgets[set][widget.id] = widget;
      delete this.widgets[widget.set][widget.id];
 	  widget.set=set;
 	  // there is no need to do request ad the data is already there,
 	  // but the widgets need to recompute the data.
       widget.afterRequest(); // true is to only generate resultsets
	},
	
   /** 
   * Joan Codina
   * adds a relationship of dupliate between two sets. The query changes on the original set are transferred to the duplicated one . 
   * @param the duplicated set. 
   * @param the original set. 
   */
  addDuplicate : function(setD,setO) {
        this.store[setO].addDuplicate(setD);		
	},
      
  /* Joan Codina
   * get duplicates of a given set . 
   * @param the original set. 
   * @retruns the list of duplicated values. 
   */
  getDuplicates : function(set) {

 		return (this.store[set].getduplicates());
	},
  
  /**
   * Set the manager's parameter store.
   *
   * @param {AjaxSolr.ParameterStore} store
   */
  setStore: function (store,set) { 
    store.manager = this;
    store.set=set;
    this.store[set] = store;
  },

  /** 
   * Adds a widget to the manager.
   *
   * @param {AjaxSolr.AbstractWidget} widget
   */
  addWidget: function (widget,set) { 
    widget.manager = this;
    widget.set =set;
    this.widgets[set][widget.id] = widget;
    return widget;
  },
 /** 
   * Stores the Solr parameters to be sent to Solr and sends a request to Solr.
   * If the set has duplicates, then the duplicated sets are also computed
   * Once all the requests have been performed, then it performs the 
   * update of the widgets.
   * The widgets that are updated are the ones of the current resultset,
   * Set 0 is allways added
   * 
   * @param {Boolean} [start] The Solr start offset parameter.
   * @param {String} [servlet] The Solr servlet to send the request to.
   */
  doSetsRequest: function (sets,start,servlet) {
    if (this.initialized === false) {
      this.init();
    }
    if (sets.length ==0) return;
    if (servlet === undefined) {
      servlet = this.servlet;
    }
    // if not there add set 0;
    var isThere=false;
    for (set=0;set<sets.length;set++){
    	if (sets[set]==0) isThere=true
    }
    if (!isThere) sets.push(0);
    this.pending=sets.length;    
    for (set=0;set<sets.length;set++){
        currSet=sets[set];
    // Allow non-pagination widgets to reset the offset parameter.
        if (start !== undefined) {
        	this.store[currSet].get('start').val(start);
    	}        
    	this.store[currSet].save();

        for (var widgetId in this.widgets[currSet]) {
          this.widgets[currSet][widgetId].beforeRequest();
        } 
        this.pendingSets[currSet]=true;
        this.executeRequest(servlet,currSet);
    }
  },

  /**
   * adds a filter query to the given set 
   * thought to initialize the sets
   *
   * @param field
   * @param query
   * @param set
   * @param fixed
   */  
   addQuery: function (field, query,mode, set, fixed){
          //var str=escape(query);
          //query=str.replace(/\+/g,'%2B');
          Manager.store[set].addQByValue('fq',field, query, fixed,mode);
   },
   
   
  /** 
   * Stores the Solr parameters to be sent to Solr and sends a request to Solr.
   * If the set has duplicates, then the duplicated sets are also computed
   * Once all the requests have been performed, then it performs the 
   * update of the widgets.
   * The widgets that are updated are the ones of the current resultset,
   * 
   * @param {Boolean} [start] The Solr start offset parameter.
   * @param {String} [servlet] The Solr servlet to send the request to.
   */
  doRequest: function (start, servlet,set,last) {
    if (this.initialized === false) {
      this.init();
    }
    // Allow non-pagination widgets to reset the offset parameter.
    if (start !== undefined) {
      this.store[set].get('start').val(start);
    }
    if (servlet === undefined) {
      servlet = this.servlet;
    }

    this.store[set].save();

    for (var widgetId in this.widgets[set]) {
      this.widgets[set][widgetId].beforeRequest();
    }
    this.pending++;
    this.pendingSets[set]=true;
    if (last) {
        this.executeRequest(servlet,set,afterRequest);
    }
  },

  /**
   * An abstract hook for child implementations.
   *
   * <p>Sends the request to Solr, i.e. to <code>this.solrUrl</code> or <code>
   * this.proxyUrl</code>, and receives Solr's response. It should send <code>
   * this.store[set].string()</code> as the Solr query, and it should pass Solr's
   * response to <code>handleResponse()</code> for handling.</p>
   *
   * <p>See <tt>managers/Manager.jquery.js</tt> for a jQuery implementation.</p>
   *
   * @param {String} servlet The Solr servlet to send the request to.
   * @throws If not defined in child implementation.
   */
  executeRequest: function (servlet,set) {
    throw 'Abstract method executeRequest must be overridden in a subclass.';
  },

  /**
   * This method is executed after the Solr response data arrives. Allows each
   * widget to handle Solr's response separately.
   * The set if possible is set as  a parameter, if not, must be in the query parameters
   * @param {Object} data The Solr response.
   */
  handleResponse: function (data,set) {
    this.response[set] = data;
    this.pending--;
    if (this.pending==0){
     for (var set2=0;set2<this.sets;set2++)
       if (this.pendingSets[set2]){
        this.pendingSets[set2]=false;
        for (var widgetId in this.widgets[set2]) {
          this.widgets[set2][widgetId].afterRequest();
        }
       }
     }
  },
  
	/** 
   * Joan Codina
   *  calls the exportData function of the widget
   * this function generates a string with the 
   * csv of the data represented 
   */  
  exportWidget : function(id,set) {
      var widget=this.widgets[set][id];
      return widget.exportData();
}  
});
