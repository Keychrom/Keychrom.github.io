---
title: "NixOS installation"
description: "Install Tessa on NixOS with the flake and NixOS module, including the tessa-plain variant for VMs without 3D acceleration."
---

Tessa ships a flake with a package and a NixOS module. The module installs the
compositor, its Wayland session, the XDG portal entry, and the optional
XWayland satellite, and registers Tessa with SDDM, GDM, or greetd.

The default package uses scenefx 0.5 for rounded corners, backdrop blur, and
shadows. A `tessa-plain` variant without scenefx is provided for pixman/software
rendering. The flake pins its nixpkgs input, so the package and module are
reproducible.

> **Testing status:** the flake, module, and session were validated on NixOS
> 26.05 (x86_64, vmwgfx VM) with the plain package and pixman. The default
> scenefx package builds on NixOS but needs a GPU with working EGL/GLES2; it was
> not run on this VM because vmwgfx has no 3D acceleration.

## Requirements

- NixOS 26.05 or nixos-unstable with flakes enabled.
- A display manager for a graphical login (SDDM, GDM, greetd, and so on).
- A GPU with EGL/GLES2 for the default package.
- About 2 GB of free disk space for the Nix store closure.

Enable flakes if your configuration does not already do so:

```nix
nix.settings.experimental-features = [ "nix-command" "flakes" ];
```

## Quick start

Add the flake input and import the module. Pin the package to the flake output
so the compositor uses the locked nixpkgs revision:

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

Build and switch:

```sh
sudo nixos-rebuild switch --flake .#tessa
```

Tessa is registered as a Wayland session. Choose **Tessa** at the login screen,
or keep it as the default session through the module.

## Package only

The flake can also be used without a NixOS configuration:

```sh
nix build github:Keychrom/Tessa#tessa
nix build github:Keychrom/Tessa#tessa-plain
./result/bin/tessa --help
```

The package output contains `bin/tessa`, `bin/tessa-panel`, `bin/tessa-ctl`,
`bin/tessa-session`, the session desktop file, the portal entry, the example
config, man pages, and documentation.

## Module options

| Option | Default | Description |
| --- | --- | --- |
| `programs.tessa.enable` | `false` | Install Tessa and register its session |
| `programs.tessa.package` | package built from the module's nixpkgs | Package to install |
| `programs.tessa.configFile` | `null` | Config file installed as `/etc/tessa/config` |
| `programs.tessa.config` | `null` | Inline config; mutually exclusive with `configFile` |
| `programs.tessa.extraPackages` | `[ ]` | Terminal, launcher, IME, and tools for the session |
| `programs.tessa.xwayland` | `true` | Add `xwayland-satellite` for X11 applications |
| `programs.tessa.portals` | `true` | Enable the wlr screenshot/screencast portal |
| `programs.tessa.defaultSession` | `true` | Set the display manager's default session |

The module also enables polkit, D-Bus, and `hardware.graphics`.

## Configuration

Use `programs.tessa.config` for inline configuration, or `configFile` for a file
that should be installed as `/etc/tessa/config`:

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

The module sets `TESSA_CONFIG=/etc/tessa/config` for the session. Without these
options Tessa reads `$XDG_CONFIG_HOME/tessa/config` or
`~/.config/tessa/config` as usual. The example file is installed at
`/etc/tessa/config.example`.

## VMs and software rendering

A VM with vmwgfx, VMSVGA, or no 3D acceleration cannot create the GLES2 context
that scenefx needs. Use the plain package and the pixman renderer:

```nix
programs.tessa.package =
  tessa.packages.x86_64-linux.tessa-plain;

environment.sessionVariables.WLR_RENDERER = "pixman";

# The SDDM Wayland greeter also needs GL; use the X11 greeter on such a VM.
services.displayManager.sddm.enable = true;
services.displayManager.sddm.wayland.enable = false;
services.xserver.enable = true;

# Test VM only.
services.displayManager.autoLogin.enable = true;
services.displayManager.autoLogin.user = "your-user";
```

With pixman the panel automatically falls back to Cairo. The compositor logs
`scenefx 0` in `tessa-ctl rendering`. Window shaders are unavailable because they
need EGL; other Tessa features work normally.

This exact setup was tested on NixOS 26.05: SDDM autologin, the Tessa session,
the panel and bar, keyboard input, the launcher, foot, and XTerm through
xwayland-satellite.

## Verification

After switching, check the installed files and the session:

```sh
tessa-ctl config-check
tessa-ctl state
tessa-ctl rendering
```

`tessa-ctl rendering` reports `scenefx 1` for the default package and `scenefx 0`
for `tessa-plain`. To capture the screen from inside the session:

```sh
grim -o "$(tessa-ctl state | awk '/^OUT / { print $2; exit }')" /tmp/tessa.png
```

## Troubleshooting

**The session fails with `Failed to create EGL context` or
`Could not initialize EGL`.** The GPU has no usable EGL/GLES2. Use
`tessa-plain` with `WLR_RENDERER=pixman` as shown above.

**Tessa does not appear at the login screen.** Rebuild the system, confirm the
package is in `environment.systemPackages` (the module adds it), and check that
the display manager reads `share/wayland-sessions` from session packages. The
module uses `services.displayManager.sessionPackages`.

**X11 applications do not start.** Ensure `programs.tessa.xwayland = true` and
that `xwayland-satellite` is in the system profile. If your nixpkgs does not
provide it, add another XWayland package to `programs.tessa.extraPackages`.

**Screen sharing does not work.** Keep `programs.tessa.portals = true`; it adds
`xdg-desktop-portal-wlr` and routes the Tessa portal configuration to the wlr
backend. PipeWire is still required for screencast streams.

**The flake input moved or a dependency changed.** Run
`nix flake update` and rebuild. The package vendors the Zig build dependencies
from the revisions listed in `packaging/nix/package.nix`; those must be updated
together with `build.zig.zon`.

## Related

- [Setup & customization guide](/docs/guide/) — key bindings, rules, layouts,
  panel, effects, and session setup.
- [Rendering & games](/docs/rendering/) — the GPU panel renderer, procedural
  wallpaper, and window shaders.
- [Packaging](/docs/packaging/) — Arch, Debian, and Nix packaging notes.
