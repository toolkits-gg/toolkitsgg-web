# Themes

toolkits.gg supports per-game theming on top of a shared base. Each game defines its own palette and Mantine overrides; the registry expands those into light + dark variants and the theme switcher does the rest.

This doc covers what lives where, how a new theme gets wired in, and how the runtime picks the active theme.

## The pieces

| File / module                                  | What it does                                                                                                           |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `src/features/theme/themes/`                   | Base Mantine theme objects and the `default-light` / `default-dark` themes                                             |
| `src/games/<gameId>/core/game-config/theme.ts` | A single game's `ToolkitThemeDefinition` (palette + Mantine overrides)                                                 |
| `src/features/theme/core/generate-palette.ts`  | `generateThemeColors()` — turns a seed color into a full Mantine color tuple                                           |
| `src/features/theme/core/store.ts`             | `useMantineThemeStore` — reactive store holding the active Mantine theme object                                        |
| `src/features/game/registry/game-registry.tsx` | `getAllRegisteredThemeDefinitions()` and `getAllRegisteredThemeClassNames()` — what every theme-related consumer reads |
| `src/components/AppProviders.tsx`              | Mounts `MantineProviderWithTheme` and `next-themes`' provider                                                          |
| `MantineProviderWithTheme`                     | Reads the active theme from the store, feeds the class-name list to `next-themes`                                      |
| `SyncAndApplyTheme`                            | Two-way syncs `next-themes` ↔ the Mantine store and persists `autoChangeTheme` to `localStorage`                       |

## How the runtime resolves the active theme

```
        next-themes
        (writes data-theme + className on <html>)
              │
              ▼
       SyncAndApplyTheme  ◄────────► useMantineThemeStore
              │                              │
              ▼                              ▼
    HTML attribute updates           MantineProviderWithTheme
                                     (re-renders Mantine tree)
```

`next-themes` is configured with the list of every registered theme class name from `getAllRegisteredThemeClassNames()`. That includes:

- `default-light`
- `default-dark`
- For each game: `<gameId>-light` and `<gameId>-dark`

`SyncAndApplyTheme` keeps the two systems in lockstep. When the user toggles light/dark, `next-themes` updates the `<html>` attribute and `SyncAndApplyTheme` swaps the Mantine theme object in the store, which causes `MantineProviderWithTheme` to re-render with the right Mantine theme.

It also persists an `autoChangeTheme` flag in `localStorage` — when true, navigating to a game's page automatically switches to that game's theme.

## Anatomy of a per-game theme

Each game's `theme.ts` exports a `ToolkitThemeDefinition`. The shape (simplified):

```typescript
import type { ToolkitThemeDefinition } from "#/features/theme/core/types";
import { generateThemeColors } from "#/features/theme/core/generate-palette";

const THEME: ToolkitThemeDefinition = {
  id: "myGame",
  // Seed colors get expanded by generateThemeColors() into the 10-step Mantine tuples
  colors: {
    primary: generateThemeColors("#8b5cf6"),
    accent: generateThemeColors("#10b981"),
  },
  // Optional Mantine theme overrides — anything you'd pass to createTheme()
  mantineOverrides: {
    defaultRadius: "md",
    primaryColor: "primary",
    // ... any Mantine theme keys
  },
};

export { THEME };
```

That definition gets attached to the game's `GAME_CONFIG.THEME` in `src/games/<gameId>/core/game-config/client.ts`.

### Why `generateThemeColors()`?

Mantine wants a 10-step color tuple per named color (`color[0]` is the lightest, `color[9]` the darkest). Hand-tuning those for every shade gets tedious and inconsistent across games. `generateThemeColors()` (in `#/features/theme/core/generate-palette`) takes a single seed hex and produces the full tuple using a perceptually uniform color model (powered by `culori`). The result is theme palettes that feel coherent without per-game color science.

When in doubt, pass a single seed color and trust the generator. Only override individual steps if you have a strong visual reason.

## Light + dark variants

You don't need to write light and dark themes separately. The registry expansion does it for you:

```typescript
// game-registry.tsx
getAllRegisteredThemeDefinitions()
// returns: [
//   default-light, default-dark,
//   clairobscur-light, clairobscur-dark,
//   remnant2-light, remnant2-dark,
//   slaythespire2-light, slaythespire2-dark,
//   ...
// ]
```

The expansion lives in `src/features/theme/core/` and applies the appropriate Mantine `colorScheme` to each variant. If you need to dramatically diverge a game's dark variant from its light variant (different accent color, etc.), do it inside the theme definition by branching on `colorScheme` in the Mantine overrides — don't try to register two separate themes.

## Adding a theme

Most contributors only need to do this when adding a new game. The full path:

1. **Pick a seed color** that fits the game's identity. One or two seed colors is enough — `primary`, `secondary`, and optionally `accent`.

2. **Write `src/games/<gameId>/core/game-config/theme.ts`** following the shape above.

3. **Attach it to the game config** in `src/games/<gameId>/core/game-config/client.ts`:

   ```typescript
   import { THEME } from "./theme";
   const GAME_CONFIG = {
     // ...
     THEME,
     // ...
   } satisfies GameConfig<LocalItem, CategoryEnum>;
   ```

4. **Register the game** in `src/features/game/registry/game-registry.tsx`. Once it's there, `getAllRegisteredThemeDefinitions()` and `getAllRegisteredThemeClassNames()` pick up both light and dark variants automatically. No theme-side registration step.

5. **Verify visually** in `pnpm dev`. Navigate to your game's page, toggle light/dark from the theme switcher, and confirm the colors look right against Mantine components (buttons, inputs, cards). The most common surprise is contrast on text-on-accent — adjust the seed if a Mantine `Button` with `color="accent"` is unreadable.

## Customizing how light/dark is applied

If you need to change the toggling behavior (e.g. add a third theme variant, change persistence), the two files to look at are:

- `src/features/theme/core/store.ts` — the `useMantineThemeStore` reactive store
- `SyncAndApplyTheme` (mounted inside `MantineProviderWithTheme`) — the bridge between `next-themes` and the store

Be conservative here. Theme handling is one of the easiest places to introduce a flash-on-load or a stale-theme bug, and both are user-visible.

## Common pitfalls

- **Hardcoded colors in components.** Use Mantine's theme tokens (`var(--mantine-color-primary-6)`, `theme.colors.primary[6]`, the `c="primary.6"` prop on Mantine components) so the theme system can actually take effect. A hex string in a component is invisible to the theme switcher.
- **Forgetting to register the game.** If your theme exists but doesn't appear in the switcher, you almost certainly forgot to add the game to `GAME_REGISTRY`. The theme registry derives entirely from `GAME_REGISTRY`.
- **Light/dark flicker on first paint.** Usually means `next-themes` and the Mantine store have desynced. Clear `localStorage` and try again. If it persists, check that `SyncAndApplyTheme` is mounted inside `MantineProviderWithTheme`.
- **Subdomain navigation doesn't switch the theme.** Check the `autoChangeTheme` flag in `localStorage` — if the user has explicitly disabled it, that's expected behavior.

## Related docs

- [Architecture](ARCHITECTURE.md) — the game registry, active-game resolution, and where `THEME` fits in the larger game config.
