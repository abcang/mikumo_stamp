(function() {
  function Stamp(name, max) {
    this.name = name;
    this.max = max;
    this.count = 0;
  }

  Stamp.prototype.score = function(all) {
    return Math.floor((this.count * 10000) / (all || 1)) / 100;
  };

  var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      setTimeout(callback, 1000 / 60);
    };
  })();

  function scrollTo(container, option, cb) {
    var scrollY = container.scrollTop;
    var scrollTargetY = option.offset ||
      (option.ele && ((option.ele.offsetTop + option.ele.offsetHeight) - container.offsetHeight)) ||
      0;
    var currentTime = 0;

    var time = option.time ||
      Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / option.speed, 0.8));

    var easingEquations = {
      easeOutSine: function(pos) {
        return Math.sin(pos * (Math.PI / 2));
      },
      easeInOutSine: function(pos) {
        return (-0.5 * (Math.cos(Math.PI * pos) - 1));
      },
      easeInOutQuint: function(pos) {
        var divPos = pos / 0.5;
        if (divPos < 1) {
          return 0.5 * Math.pow(divPos, 5);
        }
        return 0.5 * (Math.pow((divPos - 2), 5) + 2);
      }
    };

    function tick() {
      currentTime += 1 / 60;

      var p = currentTime / time;
      var t = easingEquations[option.easing || 'easeInOutSine'](p);

      if (p < 1) {
        requestAnimFrame(tick);
        container.scrollTop = scrollY + ((scrollTargetY - scrollY) * t);
      } else {
        container.scrollTop = scrollTargetY;
        if (cb) {
          cb();
        }
      }
    }

    tick();
  }

  function convertData(data) {
    data.timeText = (new Date(data.time * 1000)).toString().match(/\d+:\d+/)[0];
    return data;
  }

  var socket = io('?userId=' + ((window.localStorage && window.localStorage.getItem('userId')) || 0));

  var vm = new Vue({
    el: '#chat',
    components: {
      buttonGroup: VueStrap.buttonGroup,
      progressbar: VueStrap.progressbar,
      modal: VueStrap.modal
    },
    data: {
      userId: null,
      stamps: [],
      nextScroll: null,
      type: 'mikumo',
      visible: true,
      allCount: 0,
      stampInfo: {
        anzu: new Stamp('あんず', 15),
        mikumo: new Stamp('みくも', 12),
        conoha: new Stamp('このは', 15)
      },
      showCharacter: false,
      showInfo: false,
      scrolling: false,
      scrollInit: false
    },
    methods: {
      post: function(data) {
        data.userId = this.userId;
        socket.emit('stamp', data);
      },
      changeType: function(type, event) {
        if (!this.visible) {
          // 表示
          this.visible = true;
          document.querySelector('.stamp-box').scrollTop = 0;

          // ボックスを開く時に下にフィット
          var timeline = document.querySelector('.timeline');
          var ele = document.querySelector('.timeline li:last-child');
          var stampBoxHeight = 160;
          var scrollBottom = timeline.scrollTop + timeline.offsetHeight;
          if (ele.offsetTop < scrollBottom) {
            scrollTo(timeline, { offset: (timeline.scrollHeight + stampBoxHeight), time: 0.5 });
          }
        } else if (this.type === type) {
          // 非表示
          this.visible = false;
        } else {
          // 表示切り替え
          document.querySelector('.stamp-box').scrollTop = 0;
        }
        this.type = type;
        event.preventDefault();
      },
      stampPath: function(type, num) {
        return '/stamp/' + type + '/' + num + '.jpg';
      },
      addStamp: function(el) {
        if (!this.scrollInit) return;

        var that = this;
        var timeline = document.querySelector('.timeline');

        function scrollAndSlice(ele) {
          scrollTo(timeline, { ele: ele, speed: 2000 }, function() {
            var nextScroll = that.nextScroll;
            if (nextScroll) {
              that.nextScroll = null;
              scrollAndSlice(nextScroll);
            } else {
              that.stamps = that.stamps.slice(-50);
              that.scrolling = false;
            }
          });
        }
        function shoudScroll() {
          var prevElementOffset = el.offsetTop - el.offsetHeight;
          var scrollBottom = timeline.scrollTop + timeline.offsetHeight;
          return prevElementOffset < scrollBottom;
        }

        if (this.scrolling) {
          this.nextScroll = el;
        } else if (shoudScroll()) {
          this.scrolling = true;
          scrollAndSlice(el);
        }
      }
    }
  });

  socket.on('init', function(data) {
    vm.userId = data.userId;
    if (window.localStorage) {
      window.localStorage.setItem('userId', data.userId);
    }
    vm.stamps = data.stamps.map(function(stamp) { return convertData(stamp); });
    vm.allCount = data.allCount;
    vm.stampInfo.anzu.count = data.stampInfo.anzu;
    vm.stampInfo.mikumo.count = data.stampInfo.mikumo;
    vm.stampInfo.conoha.count = data.stampInfo.conoha;
    Vue.nextTick(function() {
      var timeline = document.querySelector('.timeline');
      timeline.scrollTop = timeline.scrollHeight;
      vm.scrollInit = true;
    });
  });

  socket.on('stamp', function(data) {
    vm.allCount += 1;
    vm.stampInfo[data.type].count += 1;
    vm.stamps.push(convertData(data));
  });

  socket.on('join', function() {
    vm.stamps = vm.stamps.map(function(stamp) {
      stamp.views += 1;
      return stamp;
    });
  });
})();
