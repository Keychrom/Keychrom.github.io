---
title: "Tessa Linux ISO"
description: "Build and boot the Arch-based Tessa Linux live/installer ISO with Calamares, Japanese input, and the current Tessa desktop."
---

Tessa Linux is an Arch-based live and installer image. It boots straight into
the Tessa desktop with the Vermilion Ink theme, Japanese fonts, and Fcitx5 +
Mozc, then installs offline with Calamares from a bundled rootfs.

The ISO is built from the separate
[TessaISO](https://github.com/Keychrom/TessaISO) repository; the image itself is
not checked into git.

## Current build

| | |
| --- | --- |
| Image | `tessa-linux-2026.11.11-x86_64.iso` |
| Size | 3.4 GB |
| Tessa | current `0.2.5` development tree (`830fd87` at build time) |
| SHA256 | `358d8e4aa657bc6e3013ead24edc029167272095a1a74d3ecb6ed4c93f71e15c` |

The 2026-11-11 image includes the split `config` + `panel.conf` defaults, the
Tessa logo customization, Scenes, the unified control center, audio
output/input selection, and the current panel. UEFI live boot was verified on
the build host; the previous image was also verified through Calamares install,
GRUB boot, SDDM login, Japanese locale, and Fcitx5 on UEFI and BIOS.

## Build the ISO

Requirements: an up-to-date Arch Linux machine, a normal user with `sudo`,
network access, and about 10 GB of free disk. The first build compiles
Calamares from the AUR; later builds can reuse the cached package.

```sh
git clone https://github.com/Keychrom/TessaISO.git
cd TessaISO
./build.sh
```

To reuse a cached Calamares package:

```sh
./build.sh --no-calamares
```

To build from a local Tessa checkout instead of cloning `main`:

```sh
TESSA_SRC=/path/to/Tessa ./build.sh
```

Output: `dist/iso/tessa-linux-<date>-x86_64.iso`.

## Boot

Write the ISO to a USB stick with `dd` or a similar tool, or attach it to a VM.
The default entry boots the live Tessa session. On a VM or a machine without
usable GLES2, choose the **software rendering** boot entry; it passes
`tessa.software=1` and starts the session with `WLR_RENDERER=pixman`.

The live desktop starts one panel per output. The installer is available from
the desktop and the application menu.

## Install

Calamares installs from the bundled rootfs without downloading packages. It
creates a GPT layout with GRUB on both UEFI and BIOS, enables SDDM, and sets up
`ja_JP.UTF-8`, Noto CJK fonts, and Fcitx5 + Mozc. When the network is available,
the installer also attempts a best-effort online update.

The installed system receives the same split defaults:

```text
~/.config/tessa/config
~/.config/tessa/panel.conf
```

`/usr/share/tessa/config.example` and `/usr/share/tessa/panel.example` are
installed for reference. The `tessa-iso` package provides and conflicts with
`tessa`; remove it before switching to `tessa-git` or another Tessa package.

## Notes

- The ISO is **not Secure Boot signed**. Disable Secure Boot or enroll your own
  keys.
- The ISO's `tessa-iso` package does not install `tessa-panel-compat`. For the
  Hyprland/Niri panel bridge, use a source checkout of Tessa.
- Live-session changes are not a persistent installation; use Calamares for a
  disk install.
- Rebuild the ISO from TessaISO to pick up newer Tessa changes. The image is
  larger than GitHub's 2 GB per-file release-asset limit, so it is not attached
  to GitHub releases.

## Related

- [TessaISO build repository](https://github.com/Keychrom/TessaISO)
- [Quickstart](/docs/quickstart/)
- [Configuration files](/docs/guide/#5-configuration-basics)
