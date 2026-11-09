---
title: "Arch Linux installation"
description: "Install and update Tessa on Arch Linux with the official zig, wlroots0.20, and scenefx packages and the in-repository PKGBUILD."
---

Tessa targets the official Arch Linux packages for Zig 0.17, wlroots 0.20, and
scenefx 0.5. The repository ships a `tessa-git` PKGBUILD that builds the
compositor, panel, CLI, session entry, portal selector, and compatibility
bridge.

## Requirements

- Arch Linux x86_64
- `base-devel`, `git`, `zig`, `wlroots0.20`, and `scenefx`
- Wayland, libinput, xkbcommon, pixman, libdrm, EGL/Mesa, Cairo, Pango,
  GLib/GIO, and GdkPixbuf
- A GPU with working EGL/GLES2 for the default scenefx build

Install the build dependencies:

```sh
sudo pacman -Syu --needed base-devel git zig wlroots0.20 scenefx \
  wayland wayland-protocols libxkbcommon libinput pixman libdrm \
  libegl mesa cairo pango glib2 gdk-pixbuf2 noto-fonts-cjk
```

`noto-fonts-cjk` provides the Japanese/Chinese/Korean glyphs used by the
panel. Without any CJK font, Japanese text renders as empty boxes. A smaller
Japanese-only alternative is `adobe-source-han-sans-jp-fonts`; both families
are included in the panel's fallback list.

## Install

Clone the repository and build the package:

```sh
git clone https://github.com/Keychrom/Tessa.git
cd Tessa/packaging/arch
makepkg -si
```

The package installs:

- `/usr/bin/tessa`, `/usr/bin/tessa-panel`, `/usr/bin/tessa-ctl`
- `/usr/bin/tessa-panel-compat` (the Hyprland/Niri bridge; Python 3 is an
  optional dependency)
- `/usr/bin/tessa-session` and the Wayland session entry
- `/usr/share/tessa/config.example`
- the XDG portal entry, man pages, and documentation

Python is only needed for `tessa-panel-compat`; the compositor and native panel
do not require it.

## First session

Log out and select **Tessa** in your display manager. For a first test from a
TTY, run:

```sh
tessa
```

Tessa starts one panel per output. Copy the example configuration if you do not
have one yet:

```sh
mkdir -p ~/.config/tessa
cp /usr/share/tessa/config.example ~/.config/tessa/config
tessa-ctl config-check
```

Quit the session with `Super+Shift+E`.

## Update

`tessa-git` is a VCS package. `pacman -Syu` updates system dependencies, but it
does not rebuild a locally built VCS package by itself.

If you build from the repository PKGBUILD:

```sh
cd Tessa
git pull --ff-only
cd packaging/arch
makepkg -si
```

`makepkg` fetches the current Tessa source from GitHub and rebuilds the package.
If your checkout is a read-only mirror and `git pull` fails, re-clone the
repository or update the mirror before rebuilding.

If an AUR helper owns the package:

```sh
yay -Syu tessa-git
# or
paru -Syu tessa-git
```

After updating:

```sh
tessa-ctl config-check
tessa-ctl state | head
```

Configuration keys are additive. A missing new key uses its default; review
the guide if an option was renamed or removed. The running compositor and panel
keep the old binaries until you log out and start a new Tessa session.

For a plain wlroots build without scenefx, use the source build described in
the [guide](/docs/guide/#scenefx-effects-build); the repository PKGBUILD builds
the default scenefx variant.

## Troubleshooting

**`makepkg` fails after a system update.** Rebuild against the current
`wlroots0.20` and `scenefx` packages. Tessa does not support wlroots 0.19 or a
mixed `/opt/tessa` installation.

**The session fails with `Failed to create EGL context`.** The GPU or VM has no
usable EGL/GLES2. Build a plain variant with `-Dscenefx=false` and run with
`WLR_RENDERER=pixman`, as described in the guide.

**Tessa does not appear at the login screen.** Confirm that
`/usr/share/wayland-sessions/tessa.desktop` exists and that your display
manager scans that directory.

**The panel does not start.** Check `tessa-ctl state` for `panel 1` and
`tessa-ctl shell` for the panel role. If `tessa-panel` is not in `PATH`, the
compositor logs the restart attempts.

## Related

- [Quickstart](/docs/quickstart/) — first session and essential keys
- [Guide](/docs/guide/) — configuration, layouts, effects, and the panel
- [Packaging](/docs/packaging/) — PKGBUILD and package details
- [Tessa Panel on other compositors](/docs/panel-other-compositors/) — the
  experimental compatibility bridge
