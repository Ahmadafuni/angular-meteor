angular.module('angular-meteor.view-model', [
  'angular-meteor.utils',
  'angular-meteor.mixer',
  'angular-meteor.core'
])


/*
  A mixin which lets us bind a view model into a scope. Note that only a single view model can be bound,
  otherwise the scope might behave unexpectedly. Mainly used to define the controller as the view model,
  and very useful when wanting to use Angular's `controllerAs` syntax.
 */
.factory('$$ViewModel', [
  '$$utils',
  '$Mixer',

function($$utils, $Mixer) {
  function $$ViewModel(vm = this) {
    // Defines the view model on the scope.
    this.$$vm = vm;
  }

  // Gets an object, wraps it with scope functions and returns it
  $$ViewModel.$viewModel = function(vm) {
    if (!_.isObject(vm))
      throw Error('argument 1 must be an object');

    // Apply mixin functions
    $Mixer._mixins.forEach((mixin) => {
      // Reject methods which starts with double $
      let keys = _.keys(mixin).filter(k => k.match(/^(?!\$\$).*$/));
      let proto = _.pick(mixin, keys);
      // Bind all the methods to the prototype
      let boundProto = $$utils.bind(proto, this);
      // Add the methods to the view model
      _.extend(vm, boundProto);
    });

    // Apply mixin constructors on the view model
    $Mixer._construct(this, vm);
    return vm;
  };

  // Override $$Core.$$bind() to be bound to view model instead of scope
  $$ViewModel.$$bind = function(fn) {
    return $$utils.bind(fn, this.$$vm, this.$$throttledDigest.bind(this));
  };

  return $$ViewModel;
}]);