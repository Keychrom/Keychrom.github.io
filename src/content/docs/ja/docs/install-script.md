---
title: "Ubuntu / Debian インストーラー"
description: "install.sh で Ubuntu / Debian に現在の Tessa をインストールします。Zig 0.17 と wlroots 0.20 の依存関係も自動で整えます。"
---

`install.sh` は Ubuntu / Debian 向けのソースインストーラーです。ディストリビューションの Wayland スタックは置き換えず、足りないものだけを `/opt/tessa` にビルドします。

ディストリビューションが Zig 0.17、wlroots 0.20、scenefx 0.5、十分新しい libinput を提供していない場合に使います。Arch Linux では代わりに [PKGBUILD](/ja/docs/packaging/#arch-linux) を使ってください。

## 必要なもの

- Ubuntu 24.04 以降、または Debian 13 以降
- x86_64 または aarch64
- `sudo` を使える一般ユーザー
- ネットワーク接続と約 5 GB の空きディスク

root で実行しないでください。パッケージの導入や `/opt`・`/usr` への書き込みが必要なときは、スクリプト自身が `sudo` を呼び出します。

## クイックスタート

```sh
git clone https://github.com/Keychrom/Tessa.git
cd Tessa
./install.sh --check
./install.sh
```

`--check` はディストリビューション、利用可能な依存関係のバージョン、これからビルドするものを表示します。システムは変更しません。

インストーラーは `sudo` のパスワードを確認したあと、次の処理を行います。

1. apt のビルド依存関係を導入
2. Zig 0.17.1 をダウンロードし、SHA256 を検証
3. 必要な Wayland、libdrm、libxkbcommon、libinput、wlroots、scenefx を `/opt/tessa` にビルド
4. Tessa をビルドし、コンポジタ、パネル、CLI、セッションエントリ、ポータルセレクタ、Vermilion Ink テーマを配置
5. `/usr/local/bin/tessa`、`tessa-panel`、`tessa-ctl`、`tessa-session` のラッパーを作成

プライベートライブラリはインストール後のバイナリの RPATH から解決されます。Tessa が起動するアプリケーションへ `LD_LIBRARY_PATH` を渡しません。

## オプション

| オプション | 動作 |
| --- | --- |
| `--check` | 変更せずにインストール計画を表示 |
| `--plain` | scenefx の角丸・ブラーなしでビルド |
| `--minimal` | kitty、フォント、fcitx5/Mozc、ポータル、デスクトップユーティリティを入れない |
| `--prefix DIR` | プライベートツリーを `/opt/tessa` 以外へインストール |
| `TESSA_PREFIX=DIR` | `--prefix` と同じ |
| `-h`, `--help` | インストーラーのヘルプを表示 |

既定では `kitty`、Inter、JetBrains Mono、Noto CJK、fcitx5 + Mozc、`xdg-desktop-portal`、`xdg-desktop-portal-wlr`、PipeWire、`wlr-randr`、`grim` も導入します。サーバー用途や自分でパッケージを管理する場合は `--minimal` を使ってください。

GPU や VM が GLES2 を提供できない場合、または scenefx のエフェクトが不要な場合は `--plain` を使います。

## インストール後

現在のデスクトップからログアウトし、GDM、SDDM、greetd、LightDM などのログイン画面で **Tessa** を選びます。最初に TTY から試す場合は次を実行します。

```sh
tessa
```

Tessa は出力ごとにパネルを自動起動します。`tessa-panel` を自分で起動しないでください。終了は `Super+Shift+E` です。

設定例から始める場合:

```sh
mkdir -p ~/.config/tessa
cp /opt/tessa/share/tessa/config.example ~/.config/tessa/config
```

セッションと設定を確認します。

```sh
tessa-ctl config-check
tessa --check-config ~/.config/tessa/config
```

最初のキー操作は[クイックスタート](/ja/docs/quickstart/)、すべての設定項目は[ガイド](/ja/docs/guide/)を参照してください。

## 注意

- X11 アプリケーションには `xwayland-satellite` が必要です。Ubuntu / Debian のパッケージにはないため、上流から導入するか `TESSA_XWAYLAND_BIN` にパスを設定してください。
- ディストリビューションの `tessa` パッケージが既にある場合、`/usr/local/bin` のラッパーが優先されます。混在させず、どちらか一方にしてください。
- 自動アンインストールはありません。手動インストールを元に戻すには、`/opt/tessa`、`/usr/local/bin` の 4 つのラッパー、`/usr/share/wayland-sessions/tessa.desktop` を削除します。
- インストーラーのソースは [GitHub の install.sh](https://github.com/Keychrom/Tessa/blob/main/install.sh) です。
