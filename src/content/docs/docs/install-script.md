---
title: "Ubuntu / Debian installer"
description: "Install current Tessa on Ubuntu or Debian with install.sh, including the Zig 0.17 and wlroots 0.20 dependencies."
---

`install.sh` is the supported source installer for Ubuntu and Debian. It keeps
the distribution's Wayland stack in place and builds only the missing pieces
under `/opt/tessa`.

Use it when the distribution does not provide Zig 0.17, wlroots 0.20, scenefx
0.5, or a new enough libinput. Arch Linux users should use the
[PKGBUILD](/docs/packaging/#arch-linux) instead.

> **Testing status:** `install.sh` is new and has not been tested widely yet.
> It was verified on Ubuntu 24.04 x86_64 through building, installation, and
> dynamic-library resolution, but Debian 13/sid, aarch64, and starting the
> session on real GPU hardware are not yet covered. Treat it as experimental,
> review the script before running it, and keep a working session available.

## Requirements

- Ubuntu 24.04 or newer, or Debian 13 or newer
- x86_64 or aarch64
- A normal user account with `sudo`
- Network access and about 5 GB of free disk space

Do not run the installer as root. It invokes `sudo` itself when it needs to
install packages or write to `/opt` and `/usr`.

## Quick start

```sh
git clone https://github.com/Keychrom/Tessa.git
cd Tessa
./install.sh --check
./install.sh
```

`--check` prints the detected distribution, the available dependency versions,
and what would be built. It does not change the system.

The installer asks for your password through `sudo`, then:

1. installs the apt build dependencies
2. downloads Zig 0.17.1 and verifies its SHA256 checksum
3. builds the required Wayland, libdrm, libxkbcommon, libinput, wlroots, and
   scenefx versions under `/opt/tessa`
4. builds Tessa and installs the compositor, panel, CLI, session entry, portal
   selector, and the Vermilion Ink theme
5. creates `/usr/local/bin/tessa`, `tessa-panel`, `tessa-ctl`, and
   `tessa-session` wrappers

The private libraries are found through an RPATH on the installed binaries, so
Tessa does not export `LD_LIBRARY_PATH` to the applications it launches.

## Options

| Option | Effect |
| --- | --- |
| `--check` | Print the plan and exit without changing anything |
| `--plain` | Build without scenefx rounded corners and blur |
| `--minimal` | Skip kitty, fonts, fcitx5/Mozc, portals, and desktop utilities |
| `--prefix DIR` | Install the private tree somewhere other than `/opt/tessa` |
| `TESSA_PREFIX=DIR` | Same as `--prefix` |
| `-h`, `--help` | Show the installer help |

The default install also installs `kitty`, Inter, JetBrains Mono, Noto CJK,
fcitx5 + Mozc, `xdg-desktop-portal`, `xdg-desktop-portal-wlr`, PipeWire,
`wlr-randr`, and `grim`. Use `--minimal` on a server or when you manage those
packages yourself.

Use `--plain` when the GPU or VM cannot provide GLES2, or when you do not want
the scenefx effects.

## After installation

Log out of your current desktop and choose **Tessa** in GDM, SDDM, greetd,
LightDM, or your display manager. For a first test from a TTY, run:

```sh
tessa
```

Tessa starts one panel per output automatically. Do not start `tessa-panel`
yourself. Quit with `Super+Shift+E`.

To start from the example configuration:

```sh
mkdir -p ~/.config/tessa
cp /opt/tessa/share/tessa/config.example ~/.config/tessa/config
```

Then check the session and configuration:

```sh
tessa-ctl config-check
tessa --check-config ~/.config/tessa/config
```

See the [Quickstart](/docs/quickstart/) for the first key bindings and the
[Guide](/docs/guide/) for every configuration option.

## Notes

- X11 applications need `xwayland-satellite`. Ubuntu and Debian do not package
  it; install it from upstream or set `TESSA_XWAYLAND_BIN` to its path.
- If a distribution `tessa` package is already installed, the `/usr/local/bin`
  wrappers take precedence. Remove one of the two installations rather than
  mixing them.
- The installer does not provide an automatic uninstall command. Remove
  `/opt/tessa`, the four wrappers in `/usr/local/bin`, and
  `/usr/share/wayland-sessions/tessa.desktop` to undo a manual install.
- The installer source is [install.sh on GitHub](https://github.com/Keychrom/Tessa/blob/main/install.sh).
