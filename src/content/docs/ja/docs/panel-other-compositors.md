---
title: "ほかの Wayland Compositor で Tessa Panel を使う"
description: "互換ブリッジ tessa-panel-compat を使って、Hyprland、Niri、その他の layer-shell 対応 Wayland コンポジタで Tessa Panel を動かす方法と検証状況。"
---

:::danger[実験的機能・非常に不安定な可能性]
Tessa Panel 自体が最近追加されたテスト段階のコンポーネントです。この
ブリッジを介してほかのコンポジタと組み合わせた場合、起動失敗、クラッシュ、
描画崩れ、状態の不整合などが起こる可能性が**非常に高く**、動作は安定して
いません。日常生活のメインシェルとしてはまだ推奨しません。ターミナル、
ランチャー、セッション操作を起動できる別の手段を必ず残してください。
:::

Tessa Panel は通常の layer-shell クライアントです。小さな Python 3 製の
互換ブリッジ `tessa-panel-compat` を介すると、Hyprland、Niri、その他の
Wayland コンポジタでも Tessa の見た目とパネルの大部分を使えます。

ブリッジはパネル側には Tessa IPC を、ホスト側にはコンポジタの IPC を
喋ります。パネル本体は変更しません。

![Niri 26.04 上で Tessa Panel のバーとウィンドウスイッチャーを表示し、foot を 2 枚開いたところ](/compat-niri.png)

*headless Tessa 上にネストした Niri 26.04。Tessa Panel のバーとスイッチャーが
foot の 2 ウィンドウに重なって表示されています。*

## 必要なもの

- `wlr-layer-shell` に対応した Wayland コンポジタ
- ブリッジ用の Python 3.10 以降
- パネル対応でビルドした `tessa-panel`
- ウィンドウスイッチャーのスクリーンショットフォールバック用の
  `wlr-screencopy`
- ランチャーの日本語入力用の `text-input-v3`
- クリップボード履歴を使う場合は `wlr-data-control`（任意）
- 同じ D-Bus 名を奪い合わないよう、ほかの通知デーモン／トレイデーモンを停止

## パネルをビルドする

```sh
./scripts/build.sh panel
```

コンポジタを含めず `tessa-panel` だけをビルドします。パッケージ版には
`tessa-panel-compat` が含まれます。ソースツリーから直接使う場合は
`tools/` 内のスクリプトを実行してください。

## ブリッジを起動する

Hyprland または Niri のセッション内で:

```sh
tessa-panel-compat
```

ソースツリーから直接:

```sh
python3 tools/tessa-panel-compat.py
```

ブリッジは Hyprland／Niri を自動判定し、出力ごとにパネルを 1 つ起動します。
`$XDG_RUNTIME_DIR/tessa.sock` で待ち受けます。パスが埋まっている場合は
`--socket` または `TESSA_IPC` で変更してください。

デバッグ用オプション:

```sh
python3 tools/tessa-panel-compat.py --print-state   # 変換後の状態を表示
python3 tools/tessa-panel-compat.py --no-spawn      # パネルを起動せず状態だけ提供
python3 tools/tessa-panel-compat.py --verbose
```

`--print-state` は、コンポジタ更新後に出力名、ワークスペース、ウィンドウ ID の
対応を確認するのに便利です。

## キーバインド

Hyprland:

```ini
bind = SUPER, Space, exec, tessa-panel-compat --send launcher
bind = ALT, Tab, exec, tessa-panel-compat --send switcher
bind = ALT SHIFT, Tab, exec, tessa-panel-compat --send switcher-prev
```

Niri:

```kdl
binds {
    Mod+Space { spawn "tessa-panel-compat" "--send" "launcher"; }
    Alt+Tab { spawn "tessa-panel-compat" "--send" "switcher"; }
}
```

ほかのビューは `--send control`、`--send wifi`、`--send bluetooth`、
`--send notifications`、`--send calendar` で開けます。

パネルは通常の Tessa 設定（`panel_modules`、`bar_layout`、テーマ、フォント）
を読みます。別ファイルを使う場合は起動前に `TESSA_CONFIG` を設定してください。
`tessa-panel` が `PATH` にない場合は `--panel /path/to/tessa-panel` を指定します。

## 互換性の検証状況

最終検証: **2026-11-07**、Arch Linux x86_64、Tessa 0.2.5 ツリー、パネル単体
ビルド。

| ホスト | バージョン | 状態・コマンド | バー／ランチャー／スイッチャー | 状況 |
| --- | --- | --- | --- | --- |
| Tessa（ネイティブ） | 0.2.5 | ネイティブ IPC | すべて動作 | リファレンス |
| Niri | 26.04 | 実 IPC で focus / close / spawn を確認 | すべて動作 | 実機で検証済み |
| Hyprland | 0.57.0 + aquamarine 0.15.1 | 偽 `hyprctl` で確認 | 偽の状態で動作 | 実験的。実セッションは未検証 |

### 検証内容

**Niri 26.04** は headless Tessa 上にネストして起動し、Niri の実 IPC を使いました。
バーは layer-shell の排他ゾーンを確保し、ランチャーが開き、スイッチャーには
`foot` の 2 ウィンドウが並びました。`focus`、`close`、`spawn` も Niri 実機で
確認しています。Niri 26.04 はテスト時のウィンドウに対して
`tile_pos_in_workspace_view: null` を返したため、スイッチャーはスクリーン
ショットのクロップではなくモノグラム表示にフォールバックしました。安全な
動作ですが、ライブのウィンドウごとプレビューではありません。

**Hyprland 0.57.0** は、この検証環境では実セッションとして起動できませんでした。
Tessa 上でネスト起動すると、ブリッジ起動前に Hyprland が次のエラーで終了します:

```text
invalid version for global xdg_wm_base (13): expected at most 5, got 6
```

これは Aquamarine／Hyprland 側のネスト起動の問題で、パネルのエラーでは
ありません。そのため Hyprland アダプターは偽の `hyprctl` 状態と実パネルの
組み合わせで検証しました。バー、ランチャー、スイッチャーは正しく描画されて
いますが、実 Hyprland セッションでの確認が完了するまでは「実験的」です。

実 Hyprland で試せる場合は、`--print-state` と `--verbose` の出力があれば
マッピングの問題を特定できます。

## 現在の制限

- バーはワークスペース 1〜9 を前提にしています。Hyprland の特殊／名前付き
  ワークスペースや、範囲外の Niri ワークスペースは変換されません。
- Tessa 拡張、status エントリ、`tessa-ctl` 自動化は使えません。設定エディタ
  など `tessa-ctl` を呼ぶ操作は動きません。
- ライブのウィンドウごとプレビューは、ホスト側の ext キャプチャプロトコルに
  依存します。未対応の場合は wlr-screencopy のクロップかモノグラムになります。
- ブラーと角丸はコンポジタ側の機能です。Hyprland/Niri は Tessa の scenefx
  エフェクトをパネルサーフェスへ適用しません。
- 電源メニューの「終了」は無視されます。ログアウトはホスト側から行ってください。
- Alt+Tab は押して開く方式です。Tab／矢印で選択し、Enter で確定、Escape で
  キャンセルします。
- 起動前に mako／dunst などの通知デーモンと、ほかのトレイ実装を停止してください。

ブリッジの詳細とトラブルシューティングは、ガイドの
[パネルのビルド](/ja/docs/guide/#パネルのビルド) を参照してください。
