---
title: "Tessa unique features"
description: "The workflows and design choices that make Tessa more than another tiling compositor: Scenes, an integrated shell, first-class layouts, live previews, semantic themes, and Japanese-first details."
---

Tessa is not a compositor with a separate bar, launcher, notification daemon,
and a folder of scripts bolted on. The compositor and the shell are designed
together, so features that normally live in different tools can share state.

This page collects the parts that are distinctly Tessa. The centerpiece is
**Scenes** — named workspaces that remember their layout, windows, colors, and
wallpaper.

## Scenes: a workspace that remembers the work

A Scene is a reusable workspace template. Save the current workspace as
`coding`, `writing`, or `game`, then bring it back later instead of rebuilding
the same layout by hand.

```sh
tessa-ctl scene save coding
tessa-ctl scene activate coding
tessa-ctl scene apply coding 2
tessa-ctl scene list
```

A Scene stores:

- the layout and its tuning (master ratio, gaps, grid columns, mosaic settings,
  scrolling column width)
- the windows/apps that belong there
- relaunch commands captured from native Wayland clients
- floating-window geometry
- optional theme colors and a wallpaper

Applying a Scene is **non-destructive**. Windows already on the workspace stay;
only missing apps are launched. New windows are matched to the Scene and placed
on its workspace. This makes a Scene a template you can reuse, not a destructive
session reset.

### The scene deck

`Super+Shift+Tab` opens the Scene deck. Each card shows the Scene name,
workspace, layout, app/live-window counts, and up to four live window previews.
Use `Tab`/`Shift+Tab` or the arrow keys to move, `Enter`/`Space`/click to apply,
and `Esc` to close.

The previews reuse the same offscreen window capture as the Alt+Tab switcher, so
windows on inactive workspaces still appear.

### Per-scene colors and wallpaper

A Scene can carry its own visual layer:

```ini
[theme]
accent = #7aa2f7
bg = #070b14
border_active = #7aa2f7
border_inactive = #26324a
panel_bg = #0e1626
panel_fg = #e8eefc

[wallpaper]
image = ~/Pictures/Wallpapers/indigo.png
fit = cover
```

While the Scene is active, the compositor uses its window-border and background
colors for that workspace, and the panel on that output applies the Scene's
surface colors and wallpaper. Moving to a workspace without a Scene restores
the base theme and wallpaper. Different outputs can show different Scenes.

This is how a desktop can feel like a different room for different work without
running a second session.

### Limits worth knowing

Scenes are deliberately best-effort:

- XWayland windows (through `xwayland-satellite`) have no per-window PID, so
  they are matched by app-id/title but cannot be relaunched automatically.
- Tiled order, tab groups, and scrolling-column structure are approximated;
  floating geometry is restored.
- Because apply is non-destructive, windows from another Scene can share the
  workspace. Use a separate workspace for a clean context.
- Scene files are mode 0600 because command arguments may contain secrets.

The full reference is in the [Guide](/docs/guide/#scenes) and
[Customization](/docs/customization/#scenes).

## One integrated shell

The bar, launcher, notification service, tray, media controls, audio card,
control center, wallpaper, and window switcher are part of Tessa. There is no
Waybar/Rofi/mako assembly step, and no separate process to theme or keep alive.

That integration is what makes Scenes possible: layout state, window state,
theme tokens, and the panel all live in the same system.

## Layouts are first-class

Tessa ships several tiling models instead of one:

- master/stack
- mosaic
- grid
- scrolling columns
- monocle
- deck stacking
- external layout helpers

Layout and tuning are per workspace, can be cycled with `Super+T`, and are
stored separately for each output. A Scene captures the effective result.

## Live previews across the whole desktop

`Alt+Tab` opens an MRU switcher across **all outputs and workspaces**. Native
windows are rendered live into private offscreen GPU scenes, including
subsurfaces, then copied into the panel. Hidden-workspace windows get previews
too, with a blurred thumbnail backdrop per card.

The same capture path powers the Scene deck.

## A theme system, not a color string

Tessa's semantic roles (`accent`, `window.border.*`, `panel.*`, `bar.*`,
`launcher.*`, `popover.*`, `toast.*`, `wallpaper.*`) are shared by the
compositor and the panel. The unified control center has a THEME page for
changing palettes, accents, and base tones; changes are written to
`theme-colors.conf` and reload borders, panel surfaces, and wallpaper together.

Scenes extend that system one level further: colors can change with the
workspace instead of only globally or per output.

## Japanese-first details

Japanese is not an afterthought:

- locale-aware CJK font fallback selects JP variants
- Fcitx5/Mozc integration, including text-input-v3 and XIM
- Japanese documentation and a Japanese-first default environment
- UI and typography choices made for Japanese text, not just translated strings

## The panel can leave Tessa

Tessa Panel also runs on Hyprland, Niri, and other layer-shell compositors
through the compatibility bridge. The panel is still experimental in that
configuration, but it means the shell is not permanently locked to Tessa's
compositor.

## What this adds up to

| Usual setup | Tessa's approach |
| --- | --- |
| Compositor + Waybar + Rofi + mako + scripts | Compositor and shell designed together |
| Workspace layouts configured once | Per-workspace layouts with a runtime cycle |
| Window switcher shows titles or screenshots | Live per-window GPU previews across workspaces |
| Theme split across compositor and bar | Shared semantic tokens and a theme editor |
| Workspace templates via ad-hoc scripts | First-class Scenes with apps, colors, and wallpaper |
| Japanese support via font fallback | Japanese-first font, IME, and documentation path |

Tessa is still a young project. These features are the direction, not a claim
that every edge case is finished. The [Known limitations](/docs/#known-limitations)
section and the [Roadmap](/docs/roadmap/) are the honest counterweight.
