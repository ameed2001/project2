const DEFAULT_LOGO_SRC = '/header-bg.jpg';

/**
 * Use a shared logo source so server-rendered HTML and client-side hydration
 * always agree on the image URL. If `NEXT_PUBLIC_APP_LOGO_SRC` is defined it
 * can point to an external asset (e.g. https://i.imgur.com/...), otherwise we
 * fall back to the bundled `/header-bg.jpg`.
 */
export const APP_LOGO_SRC =
  process.env.NEXT_PUBLIC_APP_LOGO_SRC?.trim() || DEFAULT_LOGO_SRC;

