---
title: "NixOS へのインストール"
description: "flake と NixOS モジュールで NixOS に Tessa を導入します。3D アクセラレーションのない VM 向けの tessa-plain も説明します。"
---

Tessa はパッケージと NixOS モジュールを含む flake を提供しています。モジュールは
コンポジタ、Wayland セッション、XDG ポータル、任意の XWayland サテライトを
インストールし、SDDM・GDM・greetd のセッション一覧に Tessa を登録します。

既定のパッケージは scenefx 0.5 による角丸・背景ブラー・影を使います。
pixman のソフトウェア描画向けに、scenefx なしの `tessa-plain` も用意しています。
flake は nixpkgs を固定しているため、パッケージとモジュールを再現可能に
ビルドできます。

> **テスト状況:** flake、モジュール、セッションは NixOS 26.05（x86_64、
> vmwgfx VM）で plain パッケージ＋pixman を使って検証済みです。既定の
> scenefx パッケージは NixOS 上でビルドできますが、EGL/GLES2 が動く GPU が
> 必要です。この VM の vmwgfx には 3D アクセラレーションがないため、
> scenefx 版の実行確認はしていません。

## 必要なもの

- Flake を有効にした NixOS 26.05 または nixos-unstable
- グラフィカルログイン用のディスプレイマネージャ（SDDM、GDM、greetd など）
- 既定パッケージを使う場合は EGL/GLES2 が動作する GPU
- Nix ストアのクロージャ用に約 2 GB の空き容量

Flake が無効な場合は設定に次を追加します:

```nix
nix.settings.experimental-features = [ "nix-command" "flakes" ];
```

## クイックスタート

flake の input を追加し、モジュールを import します。パッケージは flake の
出力に固定すると、ロックされた nixpkgs でビルドされます:

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.tessa.url = "github:Keychrom/Tessa";

  outputs = { self, nixpkgs, tessa, ... }: {
    nixosConfigurations.tessa = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        tessa.nixosModules.default
        {
          programs.tessa.enable = true;
          programs.tessa.package =
            tessa.packages.x86_64-linux.tessa;

          services.displayManager.sddm.enable = true;

          programs.tessa.extraPackages = with nixpkgs.legacyPackages.x86_64-linux; [
            foot
            grim
          ];
        }
      ];
    };
  };
}
```

ビルドして切り替えます:

```sh
sudo nixos-rebuild switch --flake .#tessa
```

Tessa は Wayland セッションとして登録されます。ログイン画面で **Tessa** を
選んでください。モジュールの設定により既定セッションにもできます。

## パッケージだけを使う

NixOS の設定なしでも使えます:

```sh
nix build github:Keychrom/Tessa#tessa
nix build github:Keychrom/Tessa#tessa-plain
./result/bin/tessa --help
```

パッケージには `bin/tessa`、`bin/tessa-panel`、`bin/tessa-ctl`、
`bin/tessa-session`、セッション用 desktop ファイル、ポータル、設定例、
man ページ、ドキュメントが含まれます。

## モジュールのオプション

| オプション | 既定値 | 説明 |
| --- | --- | --- |
| `programs.tessa.enable` | `false` | Tessa と Wayland セッションを導入 |
| `programs.tessa.package` | モジュール側の nixpkgs でビルド | 使用するパッケージ |
| `programs.tessa.configFile` | `null` | `/etc/tessa/config` に置く設定ファイル |
| `programs.tessa.config` | `null` | インライン設定（`configFile` と排他） |
| `programs.tessa.extraPackages` | `[ ]` | ターミナル、ランチャー、IME、ツール |
| `programs.tessa.xwayland` | `true` | X11 用に `xwayland-satellite` を追加 |
| `programs.tessa.portals` | `true` | スクリーンショット/画面共有用の wlr ポータル |
| `programs.tessa.defaultSession` | `true` | ディスプレイマネージャの既定セッションにする |

モジュールは polkit、D-Bus、`hardware.graphics` も有効にします。

## 設定

インライン設定には `programs.tessa.config`、ファイルを置く場合は
`configFile` を使います:

```nix
programs.tessa.config = ''
  panel = true
  panel_renderer = gpu
  overlay_renderer = gpu
  wallpaper_engine = procedural
  wallpaper_animation = auto
  window-rule = app-id=foot; shader=mono
'';
```

モジュールはセッションに `TESSA_CONFIG=/etc/tessa/config` を設定します。
これらを指定しない場合、Tessa はこれまで通り
`$XDG_CONFIG_HOME/tessa/config` または `~/.config/tessa/config` を読みます。
設定例は `/etc/tessa/config.example` にインストールされます。

## VM とソフトウェア描画

vmwgfx、VMSVGA、または 3D アクセラレーションのない VM では、scenefx が
必要とする GLES2 コンテキストを作れません。plain パッケージと pixman を
使ってください:

```nix
programs.tessa.package =
  tessa.packages.x86_64-linux.tessa-plain;

environment.sessionVariables.WLR_RENDERER = "pixman";

# SDDM の Wayland グリーターも GL を必要とするため、X11 グリーターを使う。
services.displayManager.sddm.enable = true;
services.displayManager.sddm.wayland.enable = false;
services.xserver.enable = true;

# テスト VM 専用。
services.displayManager.autoLogin.enable = true;
services.displayManager.autoLogin.user = "your-user";
```

pixman ではパネルが自動で Cairo にフォールバックします。コンポジタは
`tessa-ctl rendering` で `scenefx 0` を報告します。ウィンドウシェーダーは
EGL が必要なため使えませんが、その他の機能は通常通り動作します。

この構成は NixOS 26.05 で、SDDM 自動ログイン、Tessa セッション、パネルと
バー、キーボード入力、ランチャー、foot、xwayland-satellite 経由の XTerm
まで確認済みです。

## 確認

切り替え後に、インストール内容とセッションを確認します:

```sh
tessa-ctl config-check
tessa-ctl state
tessa-ctl rendering
```

`tessa-ctl rendering` は既定パッケージなら `scenefx 1`、`tessa-plain` なら
`scenefx 0` を返します。セッション内から画面を撮るには:

```sh
grim -o "$(tessa-ctl state | awk '/^OUT / { print $2; exit }')" /tmp/tessa.png
```

## トラブルシューティング

**`Failed to create EGL context` や `Could not initialize EGL` で失敗する。**
GPU に使える EGL/GLES2 がありません。上記のように `tessa-plain` と
`WLR_RENDERER=pixman` を使ってください。

**ログイン画面に Tessa が出ない。** システムを再ビルドし、パッケージが
`environment.systemPackages` に入っていること（モジュールが追加します）、
ディスプレイマネージャが `services.displayManager.sessionPackages` の
`share/wayland-sessions` を読んでいることを確認してください。

**X11 アプリが起動しない。** `programs.tessa.xwayland = true` と
`xwayland-satellite` がシステムプロファイルにあることを確認します。
nixpkgs にない場合は `programs.tessa.extraPackages` に別の XWayland
パッケージを追加してください。

**画面共有が動かない。** `programs.tessa.portals = true` を維持してください。
`xdg-desktop-portal-wlr` が追加され、Tessa のポータル設定が wlr バックエンドに
向きます。スクリーンキャストには PipeWire も必要です。

**flake の input や依存が変わった。** `nix flake update` して再ビルドします。
パッケージは `packaging/nix/package.nix` に固定したリビジョンから Zig の
ビルド依存をコピーするため、`build.zig.zon` の変更時はそちらも更新してください。

## 関連

- [セットアップ & カスタマイズガイド](/ja/docs/guide/) — キーバインド、ルール、
  レイアウト、パネル、エフェクト、セッション設定。
- [描画・ゲーム機能](/ja/docs/rendering/) — GPU パネルレンダラー、手続き生成
  壁紙、ウィンドウシェーダー。
- [パッケージング](/ja/docs/packaging/) — Arch、Debian、Nix のパッケージング
  メモ。
