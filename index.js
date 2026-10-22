/**
 * Host half of the mobile web shell.
 *
 * The browser half owns every visual decision. This half contributes only the
 * page-level inputs that have to exist before the first paint:
 *
 * - `viewport-fit=cover`, so `env(safe-area-inset-*)` reports real insets on a
 *   notched phone and the shell can avoid the home indicator and the notch;
 * - a tiny head script that marks a phone-sized document before the app renders,
 *   so `html[data-dsh-mobile]` is already present when the first frame paints.
 *
 * `?dsh-mobile=off` keeps the shipped desktop layout for one load, as a kill
 * switch if the mobile layer ever misbehaves on a device.
 */

const VIEWPORT_TAG =
  '<meta name="viewport" content="width=device-width, initial-scale=1" />'

const MOBILE_VIEWPORT_TAG =
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />'

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
        if (!next.includes('data-dsh-mobile') && next.includes('</head>')) {
          next = next.replace('</head>', `${BOOT_SCRIPT}</head>`)
        }
        return next
      }),
    'dsh-mobile-ui: index taps',
  )
}
