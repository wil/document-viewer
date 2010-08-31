/**
 * The StateMachine module provides a way to control and monitor state in your application
 * @module StateMachine
 */

DV.StateMachine = function(states,argHash){
  this.pendingElements = argHash.elements;
  if(argHash.models){
    _.extend(this.models, argHash.models);
  }

  this.compile(states,argHash);
};

DV.StateMachine.prototype.state      = null;
DV.StateMachine.prototype.elements   = null;
DV.StateMachine.prototype.helpers    = null;
DV.StateMachine.prototype.states     = null;
DV.StateMachine.prototype.models     = {};
DV.StateMachine.prototype.events     = null;

DV.StateMachine.prototype.compile    = function(states,argHash){

  this.events     = argHash.events;
  this.helpers    = argHash.helpers;
  this.states     = states;

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

// Transition to a given state ... unless we're already in it.
DV.StateMachine.prototype.open = function(state) {
  if (this.state == state) return;
  this.state = state;
  this.states[state].apply(this, arguments);
};
