---
title: "Tessa Linux ISO"
description: "Build and boot the Arch-based Tessa Linux live/installer ISO with Calamares, Japanese input, and the current Tessa desktop."
---

Tessa Linux is an Arch-based live and installer image. It boots straight into
the Tessa desktop with the Vermilion Ink theme, Japanese fonts, and Fcitx5 +
Mozc, then installs with Calamares by downloading the target system from the
Arch mirrors with `pacstrap`. **Installation requires a working internet
connection**; Calamares checks connectivity before the install sequence and
again before partitioning.

The ISO is built from the separate
[TessaISO](https://github.com/Keychrom/TessaISO) repository; the image itself is
not checked into git.

## Current build

| | |
| --- | --- |
| Image | `tessa-linux-2026.11.14-x86_64.iso` |
| Size | 1.86 GB |
| Tessa | current `0.2.5` development tree (`acf27d0` at build time) |
| SHA256 | `eeb782d32bdf315adce93150eb42aabd541538b44169b85fda6c18f94045ace1` |

The 2026-11-14 image replaces the bundled 1.7 GB rootfs with a network install:
the ISO carries only the live system, the installer scripts, and a local
repository with the `tessa-iso` package, while `pacstrap` downloads the rest
from the Arch mirrors. The image shrank from 3.4 GB to 1.86 GB, and Tessa is now
built with `-Dcpu=baseline` so the binaries no longer depend on the build host's
CPU features. It includes the smoother spring/eased panel motion, card stagger,
hover/press feedback, IME robustness fixes (text-input focus, XIM environment
propagation, and GTK_IM_MODULE left unset), the split `config` + `panel.conf`
defaults, logo customization, Scenes, the unified control center, audio
output/input selection, and the current panel. It carries the GPL-3.0-or-later
license files. The installer payload (`pacstrap` plus chroot setup) was
exercised against a test target on the build date; UEFI live boot was verified
in VirtualBox on 2026-11-13. The previous image was also verified through
Calamares install, GRUB boot, SDDM login, Japanese locale, and Fcitx5 on UEFI
and BIOS.

## Download

- [tessa-linux-2026.11.14-x86_64.iso](https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/tessa-linux-2026.11.14-x86_64.iso)
- [SHA256SUMS](https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/SHA256SUMS)

```sh
curl -fLO https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/tessa-linux-2026.11.14-x86_64.iso
curl -fLO https://github.com/Keychrom/TessaISO/releases/download/v2026.11.14/SHA256SUMS
sha256sum -c SHA256SUMS
```

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

Calamares installs **online-only**: the welcome page requires internet access,
and a connectivity check runs before partitioning. Use the installer's network
button to connect Wi-Fi if needed. It then runs `pacstrap` against the mounted
target and downloads roughly 2.5–3.5 GB of packages from the Arch mirrors; the
ISO-local repository supplies the `tessa-iso` package itself. It creates a GPT
layout with GRUB on both UEFI and BIOS, enables SDDM, and sets up
`ja_JP.UTF-8`, Noto CJK fonts, and Fcitx5 + Mozc.

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
- Rebuild the ISO from TessaISO to pick up newer Tessa changes. At 1.86 GB the
  image now fits under GitHub's 2 GB per-file release-asset limit, although it
  is not attached to GitHub releases by default.
- Offline installation is not supported. The installer aborts without a network
  connection and downloads the target packages from the Arch mirrors.

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
