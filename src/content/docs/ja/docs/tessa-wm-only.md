---
title: "Tessa WM のみを使う"
description: "Tessa Panel を外して Tessa コンポジタだけを使い、Waybar、fuzzel、mako などの layer-shell シェルと組み合わせる方法。"
---

Tessa のコンポジタと Tessa Panel は別プロセスです。タイルレイアウト、スクロール、
エフェクト、IPC、IME、XWayland をそのまま使い、パネルだけを Waybar、Quickshell、
fuzzel、mako などの既存シェルに置き換えられます。

すでに好みのデスクトップシェルがある場合や、パネルの Cairo／Pango 依存を
含めたくない場合に向いています。

## ビルド

コンポジタだけをビルドします:

```sh
./scripts/build.sh compositor
```

`tessa` のみが生成され、`tessa-panel` と `tessa-ctl` は含まれません。IPC や
自動化 CLI も必要な場合は、パネルなしビルドを使います:

```sh
./scripts/build.sh -Dpanel=false
```

`tessa` と `tessa-ctl` を生成し、パネルの Cairo、Pango、GdkPixbuf、GIO の
ビルド依存を外します。既定ビルドとパッケージ版は 3 バイナリすべてを含むため、
この選択はソースビルド向けです。

## 設定

パネルの自動起動を無効にし、自分のシェルを起動します:

```ini
panel = false
startup = waybar
startup = swaybg -i ~/Pictures/wallpaper.png
```

`startup` は複数回書けます。設定を変えずに一時的に試す場合は
`TESSA_NO_PANEL=1` を設定してください。

`tessa-panel` がないのに `panel = true` のままにすると、コンポジタが起動を
繰り返します。`panel = false` を既定にしてください。

## 残るもの・移るもの

コンポジタ側に残るもの:

- タイルレイアウト、スクロール列、Monocle、Deck Stacking
- ウィンドウルール、アニメーション、角丸、ブラー、ウィンドウ単位エフェクト
  （scenefx ビルド）
- `tessa-ctl` IPC、拡張、イベントフック、ワークスペース自動化
- IME リレー、XWayland、layer-shell、セッションロック、出力管理

外部シェルへ移るもの:

- バー、ワークスペース表示、ウィンドウタイトル
- ランチャー、クリップボード UI
- 壁紙、通知、トレイ、メディア、音量ウィジェット
- コントロールセンター、OSD、Alt+Tab オーバーレイ

コンポジタには代替バーはありません。パネルを無効にしたまま別の layer-shell
バーを起動しないと、ワークスペース切り替えのない空のデスクトップになります。

## シェルをバインドする

Tessa のキーバインドから任意のコマンドを起動できます:

```ini
bind = SUPER+Space spawn fuzzel
bind = SUPER+Return spawn foot
```

Waybar は `startup` から起動し、exclusive zone で領域を予約します。
Quickshell などの layer-shell バーも同じです。

主な置き換え例:

| Tessa Panel の機能 | 代替 |
| --- | --- |
| バーとワークスペース | Waybar、Quickshell |
| ランチャー | fuzzel、wofi、rofi |
| 壁紙 | swaybg、hyprpaper |
| 通知 | mako、dunst |
| トレイ | Waybar のトレイモジュール |
| メディアと音量 | playerctl、wpctl、バーモジュール |

## 確認

```sh
tessa-ctl state | head
pgrep -a tessa-panel
```

2 つ目が何も出力しなければパネルは動いていません。
`./scripts/build.sh compositor` でビルドした場合、`tessa-ctl` は生成されません。
CLI が必要なら `-Dpanel=false` を使ってください。

パネルなしでビルドし、`panel = true` が設定されている場合、コンポジタは
`built without tessa-panel; panel autostart disabled` とログに出します。

## 制限

- Tessa Panel の壁紙、ランチャー、通知、トレイ、メディア、音量、コントロール
  センター、ウィンドウスイッチャーは使えません。
- `panel_modules` は効果がなく、`tessa-ctl panel` でパネルは起動しません。
- 通知デーモンとトレイデーモンは自分で用意する必要があります。
- コンポジタ側のキーバインドはそのまま使えます。なくなるのはパネルの
  クリック操作 UI です。

フル Tessa デスクトップが必要なら、既定ビルドと `panel = true` を使ってください。
別コンポジタでパネルを使う場合は
[ほかの Wayland Compositor で Tessa Panel を使う](/ja/docs/panel-other-compositors/)
を参照してください。
