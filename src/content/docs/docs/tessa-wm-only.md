---
title: "Tessa WM only"
description: "Run the Tessa compositor without Tessa Panel and use Waybar, fuzzel, mako, or another layer-shell shell."
---

Tessa's compositor and Tessa Panel are separate processes. You can keep the
tiling compositor, layouts, effects, IPC, IME relay, and XWayland support while
replacing the panel with Waybar, Quickshell, fuzzel, mako, or another
layer-shell shell.

This is the right setup if you already have a desktop shell you like, or if you
want the compositor without the panel's Cairo/Pango dependencies.

## Build

Build only the compositor:

```sh
./scripts/build.sh compositor
```

This installs `tessa` without `tessa-panel` or `tessa-ctl`. If you also want the
IPC/automation CLI, use the no-panel variant:

```sh
./scripts/build.sh -Dpanel=false
```

That builds `tessa` and `tessa-ctl` and drops the panel's Cairo, Pango,
GdkPixbuf, and GIO build dependencies. The default build and the packaged
installers still include all three binaries; this choice is for source builds.

## Configure

Disable panel autostart and start your own shell:

```ini
panel = false
startup = waybar
startup = swaybg -i ~/Pictures/wallpaper.png
```

`startup` may be repeated. For a one-off session, set `TESSA_NO_PANEL=1`
instead of editing the config.

Do not leave `panel = true` with a missing `tessa-panel` binary: the compositor
will keep trying to start it. `panel = false` is the supported configuration.
`panel.conf` is loaded after `config` and can re-enable the panel, so either set
`panel = false` there too or start with `TESSA_NO_PANEL=1`, which overrides both
files.

## What stays and what moves

The compositor keeps:

- Tiling layouts, scrolling columns, monocle, and deck stacking
- Window rules, animations, rounding, blur, and per-window effects (scenefx build)
- `tessa-ctl` IPC, extensions, event hooks, and workspace automation
- IME relay, XWayland, layer-shell, session lock, and output management

These become your external shell's job:

- Bar, workspaces display, and window titles
- Launcher and clipboard UI
- Wallpaper, notifications, tray, media, and volume widgets
- Control center, OSD, and the Alt+Tab overlay

The compositor does not contain a fallback bar. If you disable the panel and do
not start another layer-shell bar, you get an empty desktop with no visible
workspace switcher.

## Bind your shell

Tessa key bindings can start any command:

```ini
bind = SUPER+Space spawn fuzzel
bind = SUPER+Return spawn foot
```

For a Waybar setup, start Waybar from `startup` and let its exclusive zone
reserve space. Quickshell and other layer-shell bars work the same way.

Useful replacements:

| Tessa Panel feature | Common alternative |
| --- | --- |
| Bar and workspaces | Waybar, Quickshell |
| Launcher | fuzzel, wofi, rofi |
| Wallpaper | swaybg, hyprpaper |
| Notifications | mako, dunst |
| Tray | Waybar's tray module |
| Media and volume | playerctl, wpctl, a bar module |

## Verify

```sh
tessa-ctl state | head
pgrep -a tessa-panel
```

The second command should print nothing. If you built with
`./scripts/build.sh compositor`, `tessa-ctl` is not installed; use
`-Dpanel=false` if you need it.

The compositor logs `built without tessa-panel; panel autostart disabled` when
it was compiled without panel support and `panel = true` was requested.

## Limitations

- No Tessa Panel means no built-in wallpaper, launcher, notifications, tray,
  media, audio, control center, or window switcher overlay.
- `panel_modules` has no effect; `tessa-ctl panel` commands do not start a panel.
- External notification and tray daemons must be configured by you.
- The compositor's own key bindings still work; only the panel's clickable UI is
  gone.

If you want the full Tessa desktop, keep the default build and `panel = true`.
For the panel on another compositor, see
[Tessa Panel on other compositors](/docs/panel-other-compositors/).
