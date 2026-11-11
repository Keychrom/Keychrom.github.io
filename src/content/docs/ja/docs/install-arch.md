---
title: "Arch Linux へのインストール"
description: "Arch Linux 公式の zig、wlroots0.20、scenefx とリポジトリ内 PKGBUILD を使って Tessa をインストールし、更新する方法。"
---

Tessa は Arch Linux 公式パッケージの Zig 0.17、wlroots 0.20、scenefx 0.5 を
対象にしています。リポジトリには `tessa-git` PKGBUILD があり、コンポジタ、
パネル、CLI、セッションエントリ、ポータル設定、互換ブリッジをビルドします。

> **テスト状況:** 0.2.5 の headless スイートは Arch Linux x86_64 の Zig 0.17、
> wlroots 0.20、scenefx 0.5（plain / scenefx）で通過しています。この
> ツールチェーンでの実機 DRM/libinput セッションはまだ検証中です。0.2.4
> パッケージは実機の eDP-1 DRM セッションでキーボード、マウス、IME、
> XWayland まで確認済みです。

## 必要なもの

- Arch Linux x86_64
- `base-devel`、`git`、`zig`、`wlroots0.20`、`scenefx`
- Wayland、libinput、xkbcommon、pixman、libdrm、EGL/Mesa、Cairo、Pango、
  GLib/GIO、GdkPixbuf
- 既定の scenefx ビルドには EGL/GLES2 が動く GPU

ビルド依存を導入します:

```sh
sudo pacman -Syu --needed base-devel git zig wlroots0.20 scenefx \
  wayland wayland-protocols libxkbcommon libinput pixman libdrm \
  libegl mesa cairo pango glib2 gdk-pixbuf2 noto-fonts-cjk
```

`noto-fonts-cjk` はパネルが使う日本語・中国語・韓国語のグリフを提供します。
CJK フォントがないと日本語が豆腐（□）になります。日本語だけなら
`adobe-source-han-sans-jp-fonts` でも構いません。どちらのファミリもパネルの
フォールバックに含まれています。

## インストール

リポジトリを clone してパッケージをビルドします:

```sh
git clone https://github.com/Keychrom/Tessa.git
cd Tessa/packaging/arch
makepkg -si
```

インストールされるもの:

- `/usr/bin/tessa`、`/usr/bin/tessa-panel`、`/usr/bin/tessa-ctl`
- `/usr/bin/tessa-panel-compat`（Hyprland/Niri 用ブリッジ。Python 3 は任意依存）
- `/usr/bin/tessa-session` と Wayland セッションエントリ
- `/usr/share/tessa/config.example`、`/usr/share/tessa/panel.example`
- XDG ポータル設定、man ページ、ドキュメント

Python が必要なのは `tessa-panel-compat` だけで、コンポジタとネイティブ
パネルには不要です。

## 最初のセッション

ログアウトし、ディスプレイマネージャで **Tessa** を選びます。TTY から
最初の確認をする場合:

```sh
tessa
```

Tessa は出力ごとにパネルを 1 つ起動します。設定例がまだない場合:

```sh
mkdir -p ~/.config/tessa
cp /usr/share/tessa/config.example ~/.config/tessa/config
cp /usr/share/tessa/panel.example ~/.config/tessa/panel.conf
tessa-ctl config-check
tessa-panel --check
```

`config` はコンポジタの動作と共有テーマ、`panel.conf` はバー、ランチャー、
ポップオーバー、壁紙、パネルのフォント/色、ブランドロゴ、コントロールセンター、
パネル用コマンドの設定です。既存の `config` に
パネルキーがある場合はそのまま使うか移してください。既存の `panel.conf` へ
`panel.example` を上書きしないでください。

セッションは `Super+Shift+E` で終了します。

## アップデート

`tessa-git` は VCS パッケージです。`pacman -Syu` はシステムの依存を更新しますが、
ローカルでビルドした VCS パッケージ自体は再ビルドされません。

リポジトリの PKGBUILD からビルドしている場合:

```sh
cd Tessa
git pull --ff-only
cd packaging/arch
makepkg -si
```

`makepkg` は GitHub から最新の Tessa ソースを独自のソースディレクトリへ取得して
再ビルドします。ローカルの `git pull` は PKGBUILD だけを更新するため、ローカルの
変更をビルドするには `source=` をチェックアウトへ向けるか `scripts/build.sh` を
使ってください。読み取り専用ミラーで `git pull` が失敗する場合は、再 clone するか
ミラーを更新してから再ビルドします。

更新後の確認:

```sh
tessa-ctl config-check
tessa-panel --check
tessa-ctl state | head
```

設定キーは追加方式です。新しいキーがない場合は既定値が使われます。オプションの
改名・削除があった場合はガイドを確認してください。実行中のコンポジタとパネルは
古いバイナリのままなので、更新後はログアウトして新しい Tessa セッションを
開始してください。

scenefx なしの plain wlroots ビルドを使う場合は、ガイドの
[scenefx ビルド](/ja/docs/guide/) を参照してください。リポジトリの PKGBUILD は
既定の scenefx 版をビルドします。

## アンインストール

```sh
sudo pacman -Rns tessa-git      # 削除一覧を確認
rm -rf ~/.config/tessa          # 任意: config、panel.conf、scenes、theme-colors.conf
```

`pacman` は `~/.config/tessa` のユーザー設定を残します。Scene と
`theme-colors.conf` はユーザーファイルです。`scripts/install-session.sh` で
ソースから入れた場合は `PREFIX` から削除してください。

## トラブルシューティング

**システム更新後に `makepkg` が失敗する。** 現在の `wlroots0.20` と
`scenefx` に対して再ビルドしてください。Tessa は wlroots 0.19 や
`/opt/tessa` との混在構成をサポートしません。

**`Failed to create EGL context` でセッションが失敗する。** GPU または VM に
使える EGL/GLES2 がありません。ガイドに従って `-Dscenefx=false` の plain 版を
ビルドし、`WLR_RENDERER=pixman` で起動してください。

**ログイン画面に Tessa が出ない。**
`/usr/share/wayland-sessions/tessa.desktop` が存在し、ディスプレイマネージャが
そのディレクトリを読んでいることを確認してください。

**パネルが起動しない。** `tessa-ctl state` で `panel 1`、
`tessa-ctl shell` でパネルのロールを確認してください。`tessa-panel` が
`PATH` にない場合、コンポジタは再起動を試み続けます。

**セッションが終了する、または画面が真っ黒になる。** TTY から
`TESSA_DEBUG=1 tessa` で起動し、出力またはディスプレイマネージャーの
ジャーナルを確認してください（Tessa は既定でログファイルを作りません）。
`WLR_RENDERER=pixman` は `-Dscenefx=false` ビルドでのみ使えます。

**VM でポインターが見えない。** Tessa のセッションラッパーは既知の仮想 GPU で
`WLR_NO_HARDWARE_CURSORS=1` を設定します。`tessa` を直接起動する場合は自分で
設定し、`xcursor-themes` を導入してください。

## 関連

- [クイックスタート](/ja/docs/quickstart/) — 最初のセッションと基本キー
- [ガイド](/ja/docs/guide/) — 設定、レイアウト、エフェクト、パネル
- [パッケージング](/ja/docs/packaging/) — PKGBUILD とパッケージの詳細
- [ほかの Wayland Compositor で Tessa Panel を使う](/ja/docs/panel-other-compositors/)
  — 実験的な互換ブリッジ
