/**
 * The StateMachine module provides a way to control and monitor state in your application
 * @module StateMachine
 */
(function(){

  var stateMachine = function(states,argHash){
    this.pendingElements = argHash.elements;
    if(argHash.models){
      _.extend(this.models, argHash.models);
    }

    this.compile(states,argHash);
  };

  stateMachine.prototype.state      = null;
  stateMachine.prototype.elements   = null;
  stateMachine.prototype.helpers    = null;
  stateMachine.prototype.states     = null;
  stateMachine.prototype.models     = {};
  stateMachine.prototype.events     = null;

  stateMachine.prototype.compile    = function(states,argHash){

    this.events     = argHash.events;
    this.helpers    = argHash.helpers;
    this.states     = this.compileStates(states);

    // state values
    this.isFocus            = true;
    this.activeElement      = null;
    this.observers          = [];
    this.windowDimensions   = {};
    this.scrollPosition     = null;
    this.checkTimer         = {};
    this.busy               = false;
    this.annotationToLoadId = null;
    this.dragReporter       = null;
    this.compiled           = {};
    this.tracker            = {};

    this.events     = _.extend(this.events,
      { application : this,
        states      : this.states,
        elements    : this.elements,
        helpers     : this.helpers,
        models      : this.models,
        // this allows us to bind events to call the method corresponding to the current state
        compile     : function(){
          var a           = this.application;
          var methodName  = arguments[0];

          return function(){
            if(!a.events[a.state][methodName]){
              a.events[methodName].apply(a.events,arguments);
            }else{
              a.events[a.state][methodName].apply(a.events,arguments);
            }
          };
        }
      }
    );

    this.helpers    = _.extend(this.helpers,
      {
        application : this,
        states      : this.states,
        elements    : this.elements,
        events      : this.events,
        models      : this.models
      }
    );

    this.states     = _.extend(this.states,
      {
        application : this,
        helpers     : this.helpers,
        elements    : this.elements,
        events      : this.events,
        models      : this.models
      }
    );

  };

  stateMachine.prototype.compileStates = function(states) {
    var me = this;

    _.each(states, function(transition, name) {
      states[name] = function() {
        if (me.state == name) return;
        me.state = name;
        transition.apply(me, arguments);
      };
    });

    return states;
  };

  DV.stateMachine = stateMachine;

}).call(this);