---
title: "Tessa Linux ISO"
description: "Build and boot the Arch-based Tessa Linux live/installer ISO with Calamares, Japanese input, and the current Tessa desktop."
---

Tessa Linux is an Arch-based live and installer image. It boots straight into
the Tessa desktop with the Vermilion Ink theme, Japanese fonts, and Fcitx5 +
Mozc, then installs with Calamares from a bundled rootfs. **Installation
requires a working internet connection**; Calamares checks connectivity before
the install sequence and again before partitioning.

The ISO is built from the separate
[TessaISO](https://github.com/Keychrom/TessaISO) repository; the image itself is
not checked into git.

## Current build

| | |
| --- | --- |
| Image | `tessa-linux-2026.11.13-x86_64.iso` |
| Size | 3.4 GB |
| Tessa | current `0.2.5` development tree (`acf27d0` at build time) |
| SHA256 | `1d8654281154e2e63ff8cf1c5a3a62f04eec3b02749cb8ffc11635b34983089c` |

The 2026-11-13 image includes the smoother spring/eased panel motion, card
stagger, hover/press feedback, IME robustness fixes (text-input focus, XIM
environment propagation, and GTK_IM_MODULE left unset), the split `config` +
`panel.conf` defaults, logo customization, Scenes, the unified control center,
audio output/input selection, and the current panel. It is an online-only
installer and carries the GPL-3.0-or-later license files. UEFI live boot was
verified in VirtualBox on the build date; the previous image was also verified
through Calamares install, GRUB boot, SDDM login, Japanese locale, and Fcitx5 on
UEFI and BIOS.

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

Calamares installs from the bundled rootfs, but the install is **online-only**:
the welcome page requires internet access, and a connectivity check runs before
partitioning. Use the installer's network button to connect Wi-Fi if needed. It
creates a GPT layout with GRUB on both UEFI and BIOS, enables SDDM, and sets up
`ja_JP.UTF-8`, Noto CJK fonts, and Fcitx5 + Mozc. After unpacking, the installer
also attempts a best-effort package update.

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
- Offline installation is not supported. The bundled rootfs is still used, but
  the installer aborts without a network connection.

## Licensing

TessaISO build tooling is **GPL-3.0-or-later**. Tessa itself remains **MIT**;
the `tessa-iso` package declares MIT for the desktop. Arch Linux packages and
Calamares are bundled under their own licenses. The ISO installs the GPL text
and third-party notice at `/usr/share/licenses/tessa-linux-iso/`; see
[TessaISO NOTICE.md](https://github.com/Keychrom/TessaISO/blob/main/NOTICE.md)
for source locations and the written source offer.

## Related

- [TessaISO build repository](https://github.com/Keychrom/TessaISO)
- [Quickstart](/docs/quickstart/)
- [Configuration files](/docs/guide/#5-configuration-basics)
