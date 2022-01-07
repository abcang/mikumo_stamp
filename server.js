const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const Redis = require('ioredis');

const port = (process.env.REDIS_PORT && process.env.REDIS_PORT.includes(':')
  ? Number(process.env.REDIS_PORT.split(':').pop()) // for Docker
  : process.env.REDIS_PORT) || 6379;
const host = (process.env.REDIS_NAME && process.env.REDIS_NAME.split('/').pop()) // for Docker
  || process.env.REDIS_HOST || 'localhost';

const redisOption = {
  db: process.env.REDIS_DB || 0,
  port,
  host,
};

const redis = new Redis(redisOption);
const app = new Koa();

if (process.env.NODE_ENV === 'production') {
  app.use(serve(path.resolve('./public')));
} else {
  console.log('development mode'); // eslint-disable-line no-console
  app.use(serve(path.resolve('./public')));
}

const server = app.listen(process.env.PORT || 3000);
const io = require('socket.io').listen(server);

function checkData(data) {
  const { type, num } = data;
  const stamps = {
    anzu: 15,
    mikumo: 12,
    conoha: 15,
  };
  return Object.keys(stamps).includes(type)
    && Number.isInteger(num) && num > 0 && num <= stamps[type];
}

io.on('connection', async (socket) => {
  io.emit('join', {});

  const [stampsData, anzuCount, mikumoCount, conohaCount] = (await redis.multi()
    .lrange('stamps', 0, 49)
    .get('count:anzu')
    .get('count:mikumo')
    .get('count:conoha')
    .exec()).map((res) => res[1]);
  const stamps = stampsData.map((stamp) => JSON.parse(stamp));
  const stampIds = stamps.map((stamp) => stamp.id);

  // 既読数をインクリメント
  const viewsList = (await stampIds.reduce((multi, id) => multi.hincrby('views', id, 1), redis.multi()).exec()).map((res) => res[1]);

  // 初期データ配信
  await socket.emit('init', {
    userId: Number(socket.handshake.query.userId) || Number(await redis.incr('count:user')),
    stamps: stamps.map((stamp, i) => Object.assign(stamp, { views: viewsList[i] })),
    allCount: Number(anzuCount) + Number(mikumoCount) + Number(conohaCount),
    stampInfo: {
      anzu: Number(anzuCount),
      mikumo: Number(mikumoCount),
      conoha: Number(conohaCount),
    },
  });

  // 消えたスタンプの既読キーを削除
  (await redis.hkeys('views')).reduce((pipeline, id) => {
    if (stampIds.includes(Number(id))) {
      return pipeline;
    }
    return pipeline.hdel('views', id);
  }, redis.pipeline()).exec();

  socket.on('stamp', async (data) => {
    if (checkData(data)) {
      const { type, num, userId } = data;
      const id = await redis.incr('count:sum');
      const views = socket.client.conn.server.clientsCount - 1;
      const date = new Date();
      const time = parseInt(date / 1000, 10);
      const output = {
        type, num, id, userId, time,
      };
      redis.multi()
        .rpush('stamps', JSON.stringify(output))
        .hset('views', id, views)
        .ltrim('stamps', -50, -1)
        .incr(`count:${type}`)
        .incr(`count:${type}:${num}`)
        .exec();
      io.emit('stamp', Object.assign(output, { views }));
    }
  });
});
