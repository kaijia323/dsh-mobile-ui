/**
 * Host half of the mobile web shell.
 *
 * The browser half owns the visual decisions. This half contributes only the
 * page-level inputs that must exist before the first paint:
 *
 * - `viewport-fit=cover`, so `env(safe-area-inset-*)` reports real insets and
 *   the mobile layer can avoid the notch and the home indicator;
 * - the iOS standalone-app capability, so "Add to Home Screen" opens the UI
 *   without browser chrome;
 * - a tiny head script that marks a phone-sized document before the app
 *   renders, so `html[data-dsh-mobile]` is already present on the first frame.
 *
 * Keyboard handling is deliberately left to the shipped composer policy (the
 * page pans; no `interactive-widget=resizes-content`), so both halves agree on
 * one strategy.
 *
 * `?dsh-mobile=off` keeps the shipped desktop layout for one load, as a kill
 * switch if the mobile layer ever misbehaves on a device.
 */

const VIEWPORT_TAG =
  '<meta name="viewport" content="width=device-width, initial-scale=1" />'

const MOBILE_VIEWPORT_TAG =
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />'

const APPLE_CAPABLE_TAG =
  '<meta name="apple-mobile-web-app-capable" content="yes" />'

const BOOT_SCRIPT = [
  '<script>(function(){try{',
  "if(new URLSearchParams(location.search).get('dsh-mobile')==='off')return;",
  "if(window.matchMedia('(max-width: 767px)').matches)",
  "document.documentElement.setAttribute('data-dsh-mobile','');",
  '}catch(e){}})()</script>',
].join('')

/** @type {string[]} */
export const inject = ['webServer']

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 */
export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.tapIndex((html) => {
        let next = html
        if (next.includes(VIEWPORT_TAG)) {
          next = next.replace(VIEWPORT_TAG, MOBILE_VIEWPORT_TAG)
        }
        if (
          !next.includes('apple-mobile-web-app-capable') &&
          next.includes('</head>')
        ) {
          next = next.replace('</head>', `${APPLE_CAPABLE_TAG}</head>`)
        }
        if (!next.includes('data-dsh-mobile') && next.includes('</head>')) {
          next = next.replace('</head>', `${BOOT_SCRIPT}</head>`)
        }
        return next
      }),
    'dsh-mobile-ui: index taps',
  )
}
