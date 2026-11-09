---
title: "Tessa Panel on other compositors"
description: "Run Tessa Panel with Hyprland, Niri, or another layer-shell Wayland compositor through the tessa-panel-compat bridge, including the current test status."
---

:::danger[Experimental and potentially very unstable]
Tessa Panel is a recently added component and is still under active testing.
When used with another compositor through this bridge, behavior may be
**very unstable**: the panel may fail to start, crash, redraw incorrectly, or
lose state. Treat this setup as experimental, not as a daily-driver shell yet,
and keep a separate way to start a terminal, launcher, and session actions.
:::

Tessa Panel is a normal layer-shell client. With `tessa-panel-compat`, a small
Python 3 bridge, it can run on Hyprland, Niri, or another Wayland compositor
while keeping the Tessa look and most of the panel's features.

The bridge speaks the panel's Tessa IPC on one side and the host compositor's
IPC on the other. The panel itself is unchanged.

![Tessa Panel bar and window switcher running on Niri 26.04, with two foot windows](/compat-niri.png)

*Niri 26.04 nested in a headless Tessa session, running the panel bar and
switcher over two foot windows.*

## Requirements

- A Wayland compositor with `wlr-layer-shell`
- Python 3.10 or newer for the bridge
- `tessa-panel`, built with panel support
- `wlr-screencopy` for the snapshot fallback used by the window switcher
- `text-input-v3` for the launcher's Japanese input
- `wlr-data-control` for clipboard history (optional)
- No other notification or tray daemon owning the same D-Bus names

## Build the panel

```sh
./scripts/build.sh panel
```

This builds `tessa-panel` without the compositor. Packaged installs include
`tessa-panel-compat`; from a source checkout, run the script in `tools/`.

## Start the bridge

From the Hyprland or Niri session:

```sh
tessa-panel-compat
```

Or, from a source checkout:

```sh
python3 tools/tessa-panel-compat.py
```

The bridge auto-detects Hyprland or Niri and starts one panel per output. It
listens on `$XDG_RUNTIME_DIR/tessa.sock`; use `--socket` or `TESSA_IPC` if that
path is taken.

Useful options:

```sh
python3 tools/tessa-panel-compat.py --print-state   # dump the translated state
python3 tools/tessa-panel-compat.py --no-spawn      # serve state without panels
python3 tools/tessa-panel-compat.py --verbose
```

`--print-state` is the fastest way to check output names, workspaces, and window
IDs after a compositor update.

## Key bindings

Hyprland:

```ini
bind = SUPER, Space, exec, tessa-panel-compat --send launcher
bind = ALT, Tab, exec, tessa-panel-compat --send switcher
bind = ALT SHIFT, Tab, exec, tessa-panel-compat --send switcher-prev
```

Niri:

```kdl
binds {
    Mod+Space { spawn "tessa-panel-compat" "--send" "launcher"; }
    Alt+Tab { spawn "tessa-panel-compat" "--send" "switcher"; }
}
```

Other panel views are available as `--send control`, `--send wifi`,
`--send bluetooth`, `--send notifications`, `--send theme`, and
`--send calendar`.

The panel reads the normal Tessa config (`panel_modules`, `bar_layout`, theme,
fonts). Set `TESSA_CONFIG` before starting the bridge to use a specific file.
If `tessa-panel` is not in `PATH`, pass `--panel /path/to/tessa-panel`.

The THEME page in the unified control center also works in this panel-only
setup, but it changes only the panel colors. Window borders and the wallpaper
belong to Tessa's compositor, so they are unaffected. The panel writes
`theme-colors.conf` next to the active config and reloads itself; the bridge
ignores the compositor reload request.

## Compatibility status

Last tested: **2026-11-07**, Arch Linux x86_64, Tessa 0.2.5 tree, panel-only
build.

| Host | Version | State and commands | Bar / launcher / switcher | Status |
| --- | --- | --- | --- | --- |
| Tessa (native) | 0.2.5 | Native IPC | Yes | Reference |
| Niri | 26.04 | Real IPC: focus, close, spawn | Yes | Tested end-to-end |
| Hyprland | 0.57.0 + aquamarine 0.15.1 | Fake `hyprctl` fixtures | Yes, with fake state | Experimental; real session unverified |

### What was tested

**Niri 26.04** was run nested in a headless Tessa session. The bridge used
Niri's real IPC. The bar reserved its layer-shell exclusive zone, the launcher
opened, and the switcher listed two `foot` windows. `focus`, `close`, and
`spawn` commands were verified against Niri. Niri 26.04 returned
`tile_pos_in_workspace_view: null` for the test windows, so the switcher used its
monogram fallback instead of cropping the screenshot. That is safe, but it is
not a live per-window preview.

**Hyprland 0.57.0** could not be run as a real nested session in this test
environment. Starting Hyprland inside Tessa aborted before the bridge started:

```text
invalid version for global xdg_wm_base (13): expected at most 5, got 6
```

This is an Aquamarine/Hyprland nesting issue, not a panel error. The Hyprland
adapter was therefore tested with fake `hyprctl` state and the real panel; the
bar, launcher, and switcher all rendered correctly. A real Hyprland session is
still required before calling Hyprland support verified.

If you can run it in a real Hyprland session, `--print-state` and `--verbose`
output is enough to diagnose most mapping problems.

## Current limitations

- The bar maps workspaces 1–9. Hyprland special/named workspaces and Niri
  workspaces outside that range are not translated.
- Tessa extensions, status entries, and `tessa-ctl` automation are unavailable.
  Actions that invoke `tessa-ctl`, such as the config editor, will not work.
- Live per-window previews depend on the host compositor's ext capture
  protocols. Otherwise the switcher falls back to wlr-screencopy crops or
  monograms.
- Blur and rounded corners are compositor-side. Hyprland/Niri do not apply Tessa's
  scenefx effects to panel surfaces.
- The power menu's Quit action is ignored; log out through the host compositor.
- Alt+Tab is press-to-open, not hold-to-cycle. Use Tab/arrow keys and Enter to
  commit, or Escape to cancel.
- Stop other notification daemons (mako, dunst) and tray implementations before
  starting the bridge.

For the underlying bridge details and troubleshooting, see the
[panel build section](/docs/guide/#panel-build) in the guide.
