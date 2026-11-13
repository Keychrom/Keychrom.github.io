---
title: "Tessa Linux ISO"
description: "Calamares、日本語入力、最新の Tessa デスクトップを収録した Arch ベースの Tessa Linux ライブ/インストーラー ISO のビルドと起動方法。"
---

Tessa Linux は Arch Linux ベースのライブ/インストーラーイメージです。起動すると
Vermilion Ink テーマ、日本語フォント、Fcitx5 + Mozc 入りの Tessa デスクトップが
立ち上がり、Calamares が Arch ミラーから `pacstrap` でターゲットを取得して
インストールします。**インストールにはインターネット接続が必要**です。
Calamares はインストール開始前とパーティション作成前に接続を確認します。

ISO は別リポジトリの
[TessaISO](https://github.com/Keychrom/TessaISO) でビルドします。イメージ自体は
git には含まれません。

## 現在のビルド

| | |
| --- | --- |
| イメージ | `tessa-linux-2026.11.14-x86_64.iso` |
| サイズ | 1.86 GB |
| Tessa | 現在の `0.2.5` 開発ツリー（ビルド時 `acf27d0`） |
| SHA256 | `eeb782d32bdf315adce93150eb42aabd541538b44169b85fda6c18f94045ace1` |

2026-11-14 のイメージは、同梱していた 1.7 GB の rootfs を廃止してネットワーク
インストールに切り替えました。ISO にはライブ環境、インストーラースクリプト、
`tessa-iso` パッケージのローカルリポジトリだけを収録し、残りのパッケージは
`pacstrap` が Arch ミラーから取得します。イメージは 3.4 GB から 1.86 GB に
縮小し、Tessa は `-Dcpu=baseline` でビルドするようになったため、ビルドホストの
CPU 機能に依存しなくなりました。スプリング／イーズの滑らかなパネルモーション、
カード stagger、hover/press フィードバック、IME の堅牢化（text-input の
フォーカス、XIM 環境の伝播、GTK_IM_MODULE の未設定化）、分割された
`config` + `panel.conf` の既定値、Tessa ロゴのカスタマイズ、Scene、統合
コントロールセンター、オーディオの出力/入力デバイス選択、最新パネルを含みます。
GPL-3.0-or-later のライセンスファイルも同梱します。インストーラーのペイロード
（`pacstrap` と chroot セットアップ）はビルド日にテスト用ターゲットで実行確認し、
UEFI ライブ起動は 2026-11-13 に VirtualBox で確認済みです。前回のイメージでは
Calamares インストール、GRUB 起動、SDDM ログイン、日本語ロケール、Fcitx5 を
UEFI/BIOS の両方で確認しています。

## ダウンロード

- [tessa-linux-2026.11.14-x86_64.iso](https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/tessa-linux-2026.11.14-x86_64.iso)
- [SHA256SUMS](https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/SHA256SUMS)

```sh
curl -fLO https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/tessa-linux-2026.11.14-x86_64.iso
curl -fLO https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/SHA256SUMS
sha256sum -c SHA256SUMS
```

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

Calamares は**オンライン専用**でインストールします。ウェルカム画面で
インターネット接続が必須になり、パーティション作成前に接続チェックが走ります。
Wi-Fi はインストーラーのネットワークボタンから設定してください。その後、
マウントしたターゲットへ `pacstrap` を実行し、Arch ミラーから約 2.5〜3.5 GB の
パッケージをダウンロードします。`tessa-iso` パッケージ本体は ISO 内の
ローカルリポジトリから供給されます。GPT レイアウトを作成し、UEFI と BIOS の
両方に GRUB を入れ、SDDM、`ja_JP.UTF-8`、Noto CJK、Fcitx5 + Mozc を設定します。

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
- 新しい Tessa を反映するには TessaISO から ISO を再ビルドします。1.86 GB に
  なったため GitHub のリリースアセット上限（1 ファイル 2 GB）内に収まりますが、
  既定では GitHub Releases に添付していません。
- オフラインインストールには対応しません。ネットワークがないとインストーラーは
  中断し、ターゲットのパッケージは Arch ミラーからダウンロードされます。

## ライセンス

TessaISO のビルドツールは **GPL-3.0-or-later**、Tessa 本体は **MIT** です。
`tessa-iso` パッケージはデスクトップに対して MIT を宣言しています。Arch Linux
パッケージと Calamares はそれぞれのライセンスで同梱されます。ISO は GPL 全文と
サードパーティ通知を `/usr/share/licenses/tessa-linux-iso/` に配置します。
ソース入手先と written offer は
[TessaISO NOTICE.md](https://github.com/Keychrom/TessaISO/blob/main/NOTICE.md)
を参照してください。

## 関連

- [TessaISO ビルドリポジトリ](https://github.com/Keychrom/TessaISO)
- [クイックスタート](/ja/docs/quickstart/)
- [設定ファイル](/ja/docs/guide/#5-設定の基本)
