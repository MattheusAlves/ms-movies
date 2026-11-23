// Sizes listed by TMDB's /configuration endpoint for each image category.
// The value names the TMDB size token requested from the CDN; next/image
// still serves right-sized derivatives to the browser based on `sizes`,
// so raising these costs source quality, not user bandwidth.
export const imageConfig = {
  // Grid and detail posters. w500 covers the ~230px cards (2x retina)
  // since the wide-screen breakpoints cap poster width.
  posterWidth: 500,
  // Detail-page hero poster fallback (renders up to 300px CSS; w780
  // covers 2x retina with headroom).
  detailPosterWidth: 780,
  backdropWidth: 300,
  // Full-bleed cover hero / detail backdrop, rendered at 100vw.
  // 'original' is the only TMDB step above w1280 and the only one
  // that survives 2x+ screens (2560px+) without upscaling.
  backdropHeroWidth: 'original',
  // Cast portraits render at 144px CSS; h632 is TMDB's fixed-height
  // profile crop above w185 and covers high-DPI displays.
  profileWidth: 'h632'
} as const
