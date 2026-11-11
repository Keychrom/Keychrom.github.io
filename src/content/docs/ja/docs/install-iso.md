---
title: "Tessa Linux ISO"
description: "Calamares、日本語入力、最新の Tessa デスクトップを収録した Arch ベースの Tessa Linux ライブ/インストーラー ISO のビルドと起動方法。"
---

Tessa Linux は Arch Linux ベースのライブ/インストーラーイメージです。起動すると
Vermilion Ink テーマ、日本語フォント、Fcitx5 + Mozc 入りの Tessa デスクトップが
立ち上がり、同梱 rootfs から Calamares でオフラインインストールできます。

ISO は別リポジトリの
[TessaISO](https://github.com/Keychrom/TessaISO) でビルドします。イメージ自体は
git には含まれません。

## 現在のビルド

| | |
| --- | --- |
| イメージ | `tessa-linux-2026.11.11-x86_64.iso` |
| サイズ | 3.4 GB |
| Tessa | 現在の `0.2.5` 開発ツリー（ビルド時 `830fd87`） |
| SHA256 | `358d8e4aa657bc6e3013ead24edc029167272095a1a74d3ecb6ed4c93f71e15c` |

2026-11-11 のイメージは、分割された `config` + `panel.conf` の既定値、
Tessa ロゴのカスタマイズ、Scene、統合コントロールセンター、オーディオの
出力/入力デバイス選択、最新パネルを含みます。UEFI ライブ起動をビルド機で
確認済みです。前回のイメージでは Calamares インストール、GRUB 起動、SDDM
ログイン、日本語ロケール、Fcitx5 を UEFI/BIOS の両方で確認しています。

## ISO をビルドする

必要なもの: 最新の Arch Linux、`sudo` を使える通常ユーザー、ネットワーク、
約 10 GB の空きディスク。初回は AUR から Calamares をビルドするため時間が
かかります。2 回目以降はキャッシュを再利用できます。

```sh
git clone https://github.com/Keychrom/TessaISO.git
cd TessaISO
./build.sh
```

Calamares のキャッシュを使い回す場合:

```sh
./build.sh --no-calamares
```

`main` の clone ではなくローカルの Tessa チェックアウトからビルドする場合:

```sh
TESSA_SRC=/path/to/Tessa ./build.sh
```

出力: `dist/iso/tessa-linux-<date>-x86_64.iso`。

## 起動

`dd` などで USB メモリへ書き込むか、VM に接続します。既定のエントリで
Tessa ライブセッションが起動します。GLES2 が使えない VM や実機では
**ソフトウェアレンダリング**のエントリを選んでください。`tessa.software=1` が
渡され、`WLR_RENDERER=pixman` で起動します。

ライブデスクトップは出力ごとにパネルを 1 つ起動します。インストーラーは
デスクトップとアプリケーションメニューから起動できます。

## インストール

Calamares はパッケージをダウンロードせず、同梱 rootfs からインストールします。
GPT レイアウトを作成し、UEFI と BIOS の両方に GRUB を入れ、SDDM、
`ja_JP.UTF-8`、Noto CJK、Fcitx5 + Mozc を設定します。ネットワークがある場合は
ベストエフォートでオンライン更新も試みます。

インストール先にも同じ分割設定が入ります:

```text
~/.config/tessa/config
~/.config/tessa/panel.conf
```

参照用に `/usr/share/tessa/config.example` と
`/usr/share/tessa/panel.example` もインストールされます。`tessa-iso` パッケージは
`tessa` を提供し、競合します。`tessa-git` などへ切り替える前に削除してください。

## 注意

- ISO は **Secure Boot 署名されていません**。Secure Boot を無効にするか、自分の
  鍵を登録してください。
- ISO の `tessa-iso` パッケージには `tessa-panel-compat` が含まれません。
  Hyprland/Niri 用パネルブリッジは Tessa のソースチェックアウトから使ってください。
- ライブセッションの変更は永続インストールではありません。ディスクへ入れるには
  Calamares を使ってください。
- 新しい Tessa を反映するには TessaISO から ISO を再ビルドします。イメージは
  GitHub のリリースアセット上限（1 ファイル 2 GB）を超えるため、GitHub Releases
  には添付していません。

## 関連

- [TessaISO ビルドリポジトリ](https://github.com/Keychrom/TessaISO)
- [クイックスタート](/ja/docs/quickstart/)
- [設定ファイル](/ja/docs/guide/#5-設定の基本)
