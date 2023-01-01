みくもスタンプ
===

[みくもスタンプ](https://stamp.mikumo.abcang.net)

https://github.com/abcang/mikumo_fanclub に統合

## 必要な環境
* Node.js v16以上
* redis

## 開発

```bash
$ npm i
$ npm run dev
```

## 実行

```bash
$ npm i
$ npm run release-build
$ npm start
```

dockerを使う場合

```bash
$ docker build -t mikumo_stamp .
$ docker run -it --rm -p 3000:80 --link redis:redis mikumo_stamp
```

## ライセンス
コード: MIT  
画像: ©GMO Internet, Inc.  
画像の再利用は禁止です
