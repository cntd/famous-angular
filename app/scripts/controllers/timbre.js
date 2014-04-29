'use strict';

angular.module('integrationApp')
  .controller('TimbreCtrl', function ($scope, famous, testFilterService, Fakedata, $timeout) {
  	$scope.yo ={a:'shoe'}
  	window.a = $scope
  	var EventHandler = famous['famous/core/EventHandler'];
  	var GenericSync = famous['famous/inputs/GenericSync'];
    var Transitionable = famous['famous/transitions/Transitionable'];
    var Easing = famous['famous/transitions/Easing'];
    $scope.enginePipe = new EventHandler();
    $scope.enginePipe2 = new EventHandler();
    $scope.search = {name:''}
    $scope.events = angular.copy(Fakedata.events);
    console.log('events', $scope.events);

    console.log('normal controller bag', famous.bag._contents); //has access to items created in DOM

    $scope.strips = [
      {
        id: 1,
        label: "Strip 1"
      },
      {
        id: 2,
        label: "Strip 2"
      },
      {
        id: 3,
        label: "Strip 3"
      }
    ]

    $scope.$watch(function(){return $scope.search.name},
      function(){
        testFilterService.setField($scope.search.name);
      });

    $scope.rand = function(){
      return (Math.random() * (.6-.1) + .1);

    };

    $scope.setEvent = function(e){
      console.log('set event', e)
      $scope.activeEvent = e;
      $scope.tran.set(-1, {duration:"500", curve:Easing.outBounce});
    };

    $scope.getLineX = function(e){
      return e.rand < .45 ? 0 : 0;
    }

    $scope.getLineWidth = function(e){
      return e.rand > .45 ? 320-(e.rand*320) : e.rand*320;
    }

    $scope.handleZ = function(e){
      return e.rand < .45 ? Math.PI : 0;
    }

    $scope.tran = new Transitionable(0);
    $scope.sync = new GenericSync(function(){
      return $scope.tran.get();
    }, {direction: GenericSync.DIRECTION_X});

    var SCROLL_SENSITIVITY = 550; //inverse
    $scope.sync.on('update', function(data){
      var newVal = Math.max(0,
        Math.min(1, data.delta / SCROLL_SENSITIVITY + $scope.tran.get()));
      $scope.tran.set(newVal);
    });
    $scope.enginePipe.pipe($scope.sync);
    $scope.horizontalTimeline = function(){
      return $scope.tran.get();
    };

    var TOUCHING = null;
    var MODE = null;
    var MIN_X_THRESH = 1;

    $scope.enginePipe.on("touchstart", function (e){
      TOUCHING = [e.touches[0].pageX,e.touches[0].pageY];
      svStopped = false;
    });
    $scope.enginePipe.on("touchmove", function (e){
      var xd = Math.abs(TOUCHING[0] - e.touches[0].pageX);
      var yd = Math.abs(TOUCHING[1] - e.touches[0].pageY);
      if (!MODE){
        MODE = xd > yd && xd > MIN_X_THRESH ? 'X' : 'Y';
        if(MODE === 'Y'){
          linesIn();
        } else {
          $scope.disableScrollView();
        }
      }
    });
    $scope.enginePipe.on("touchend", function(){
      TOUCHING = false;
      var x = $scope.tran.get() > 0.4 ? 0.85 : 0;
      if (MODE === "X"){
        $scope.tran.set(x, {duration:"500", curve:Easing.outBounce});
      } else {
        $scope.tran.set(0);
      }
      
      MODE = null;
      $scope.enableScrollView();

      if (Math.abs(famous.bag.first("scrollView").getVelocity()) < 0.001 && !lines){
        console.log(famous.bag.first("scrollView").getVelocity())
        linesOut();
      }
    })

    $scope.viewAX = function(){
      if (MODE === "Y") {return 0;}
      return $scope.tran.get()*320;
    }

    var _lineTrans = new Transitionable(0);
    $scope.linesTimeline = function(){
      return _lineTrans.get();
    }

    var svStopped = null;
    var lines = null
    function linesOut(){
      _lineTrans.set(0, {duration: 800, curve: Easing.outBounce});
      lines = true;
    }
    function linesIn(){
      _lineTrans.set(1, {duration: 300, curve: 'easeOut'});
      lines = false;
    }

    $scope.$on("scrollview Stopped", function(){
      if (!TOUCHING){
        linesOut();
      }
      svStopped = true;
    })





  });

