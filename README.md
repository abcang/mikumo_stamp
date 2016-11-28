みくもスタンプ
===

[みくもスタンプ](https://stamp.mikumo.abcang.net)

## 必要な環境
* Node.js v7以上
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

## Google Analyticsの設定

`client/src/_data.json`にファイルを作成

```json
{
  "analytics": "UA-XXXX"
}
```

## ライセンス
コード: MIT  
画像: ©GMO Internet, Inc.  
画像の再利用は禁止です
