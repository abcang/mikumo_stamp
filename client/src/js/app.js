import '../css/app.sass';
import domready from 'domready';

class Stamp {
  constructor(name, max) {
    this.name = name;
    this.max = max;
    this.count = 0;
  }

  score(all) {
    return Math.floor((this.count * 10000) / (all || 1)) / 100;
  }
}

const requestAnimFrame = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || ((callback) => setTimeout(callback, 1000 / 60));

function scrollTo(container, option, cb) {
  const scrollY = container.scrollTop;
  const scrollTargetY = option.offset
      || (option.ele && ((option.ele.offsetTop + option.ele.offsetHeight) - container.offsetHeight))
      || 0;
  let currentTime = 0;

  const time = option.time
      || Math.max(0.1, Math.min(Math.abs(scrollY - scrollTargetY) / option.speed, 0.8));

  const easingEquations = {
    easeOutSine(pos) {
      return Math.sin(pos * (Math.PI / 2));
    },
    easeInOutSine(pos) {
      return (-0.5 * (Math.cos(Math.PI * pos) - 1));
    },
    easeInOutQuint(pos) {
      const divPos = pos / 0.5;
      if (divPos < 1) {
        return 0.5 * divPos ** 5;
      }
      return 0.5 * ((divPos - 2) ** 5 + 2);
    },
  };

  function tick() {
    currentTime += 1 / 60;

    const p = currentTime / time;
    const t = easingEquations[option.easing || 'easeInOutSine'](p);

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
  // eslint-disable-next-line prefer-destructuring
  data.timeText = (new Date(data.time * 1000)).toString().match(/\d+:\d+/)[0];
  return data;
}

domready(() => {
  const socket = io(`?userId=${(window.localStorage && window.localStorage.getItem('userId')) || 0}`);

  const vm = new Vue({
    el: '#chat',
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
        conoha: new Stamp('このは', 15),
      },
      showCharacter: false,
      showInfo: false,
      scrolling: false,
      scrollInit: false,
    },
    methods: {
      post(data) {
        data.userId = this.userId;
        socket.emit('stamp', data);
      },
      changeType(type, event) {
        if (!this.visible) {
          // 表示
          this.visible = true;
          document.querySelector('.stamp-box').scrollTop = 0;

          // ボックスを開く時に下にフィット
          const timeline = document.querySelector('.timeline');
          const ele = document.querySelector('.timeline li:last-child');
          const stampBoxHeight = 160;
          const scrollBottom = timeline.scrollTop + timeline.offsetHeight;
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
      stampPath(type, num) {
        return `/stamp/${type}/${num}.jpg`;
      },
      addStamp(el) {
        if (!this.scrollInit) return;

        const that = this;
        const timeline = document.querySelector('.timeline');

        function scrollAndSlice(ele) {
          scrollTo(timeline, { ele, speed: 2000 }, () => {
            const { nextScroll } = that;
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
          const prevElementOffset = el.offsetTop - el.offsetHeight;
          const scrollBottom = timeline.scrollTop + timeline.offsetHeight;
          return prevElementOffset < scrollBottom;
        }

        if (this.scrolling) {
          this.nextScroll = el;
        } else if (shoudScroll()) {
          this.scrolling = true;
          scrollAndSlice(el);
        }
      },
    },
  });

  socket.on('init', (data) => {
    vm.userId = data.userId;
    if (window.localStorage) {
      window.localStorage.setItem('userId', data.userId);
    }
    vm.stamps = data.stamps.map((stamp) => convertData(stamp));
    vm.allCount = data.allCount;
    vm.stampInfo.anzu.count = data.stampInfo.anzu;
    vm.stampInfo.mikumo.count = data.stampInfo.mikumo;
    vm.stampInfo.conoha.count = data.stampInfo.conoha;
    Vue.nextTick(() => {
      const timeline = document.querySelector('.timeline');
      timeline.scrollTop = timeline.scrollHeight;
      vm.scrollInit = true;
    });
  });

  socket.on('stamp', (data) => {
    vm.allCount += 1;
    vm.stampInfo[data.type].count += 1;
    vm.stamps.push(convertData(data));
  });

  socket.on('join', () => {
    vm.stamps = vm.stamps.map((stamp) => {
      stamp.views += 1;
      return stamp;
    });
  });
});
