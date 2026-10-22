/**
 * Mobile web shell for the Harness Web GUI (browser half).
 *
 * Everything here is additive and gated by `html[data-dsh-mobile]`:
 * - the left rail stops taking grid space and becomes an overlay drawer;
 * - the conversation owns the whole viewport, with a leading drawer button in
 *   the resident header instead of the rail;
 * - touch sizes, safe areas, keyboard-height tracking and reading typography.
 *
 * A desktop viewport never receives the attribute, so the shipped layout is
 * untouched. `?dsh-mobile=off` disables the layer for one load.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-mobile-ui',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-mobile-ui';
    const STYLE_ID = 'dsh-mobile-ui/styles';
    const MOBILE_QUERY = '(max-width: 767px)';
    const FRAME_SELECTOR =
      '#root > [data-slot="root"] > div:has(> [data-shell-overlay])';

    const FALLBACKS = {
      openNavigation: 'Open navigation',
    };

    const DICTS = {
      zh: { openNavigation: '打开导航' },
      en: { openNavigation: 'Open navigation' },
    };

    const CSS = `
/* ============================================================
   Mobile web shell. Every rule is gated by html[data-dsh-mobile];
   a desktop viewport never receives that attribute.
   ============================================================ */

html[data-dsh-mobile] {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

html[data-dsh-mobile],
html[data-dsh-mobile] body {
  height: 100%;
  overflow: hidden;
  overscroll-behavior-y: none;
  -webkit-tap-highlight-color: transparent;
}

/* The conversation owns the viewport: neither side column takes grid
   space any more. Both are re-seated as overlays below. */
html[data-dsh-mobile] #root > [data-slot="root"] > div:has(> [data-shell-overlay]) {
  grid-template-columns: 0 minmax(0, 1fr) 0 !important;
  height: var(--dsh-mobile-vv, 100%);
  transition: none !important;
}

/* Left column -> overlay navigation drawer. */
html[data-dsh-mobile] #root > [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
  position: fixed !important;
  top: 0;
  left: 0;
  width: min(84vw, 320px) !important;
  height: var(--dsh-mobile-vv, 100%) !important;
  z-index: 60;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 0 16px 16px 0;
  box-shadow: 0 18px 56px rgba(15, 17, 21, 0.26);
  transform: translateX(-104%);
  visibility: hidden;
  transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1), visibility 260ms;
  will-change: transform;
}

html[data-dsh-mobile] #root > [data-slot="root"] > div:not([data-sidebar-collapsed]) > div:has(> [data-slot="sidebar"]) {
  transform: translateX(0);
  visibility: visible;
}

/* Dimmed backdrop under the open drawer. */
html[data-dsh-mobile] #root > [data-slot="root"] > div:not([data-sidebar-collapsed]) > div:has(> [data-slot="main"])::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(15, 17, 21, 0.36);
}

/* Header: reclaim the horizontal padding and honour the notch. */
html[data-dsh-mobile] [data-slot="conversation.header"] > header {
  padding-top: calc(8px + env(safe-area-inset-top)) !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

/* The leading seat's drawer button. */
html[data-dsh-mobile] [data-dsh-mobile-nav] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 34px;
  height: 34px;
  margin-right: 2px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

html[data-dsh-mobile] [data-dsh-mobile-nav]:active {
  background: var(--dsw-alias-bg-layer-2);
}

/* Reading: phone-sized body copy and code. */
html[data-dsh-mobile] body {
  --dsh-content-font-size: 16px !important;
  --dsh-code-font-size: 13.5px !important;
}

/* Composer: full-width, safe area below, 16px so iOS does not zoom on focus. */
html[data-dsh-mobile] [data-composer-seat] {
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

html[data-dsh-mobile] [data-conversation-region="composer"] [contenteditable="true"] {
  font-size: 16px !important;
  line-height: 24px !important;
}

html[data-dsh-mobile] [data-conversation-region="composer"] button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Touch devices: no hover-only affordances, and comfortable targets. */
@media (hover: none) {
  html[data-dsh-mobile] [data-slot="sidebar"] button,
  html[data-dsh-mobile] [data-slot="conversation.header"] button,
  html[data-dsh-mobile] [data-conversation-region="composer"] button {
    min-height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html[data-dsh-mobile] #root > [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
    transition: none;
  }
}
`;

    /** @returns {boolean} */
    function isDisabled() {
      try {
        return (
          new URLSearchParams(window.location.search).get('dsh-mobile') === 'off'
        );
      } catch {
        return false;
      }
    }

    /** @returns {boolean} */
    function matchesMobile() {
      return window.matchMedia(MOBILE_QUERY).matches;
    }

    /** @returns {HTMLElement | null} */
    function frame() {
      return document.querySelector(FRAME_SELECTOR);
    }

    /** @returns {boolean} */
    function drawerOpen() {
      const node = frame();
      return node !== null && !node.hasAttribute('data-sidebar-collapsed');
    }

    /**
     * Reactive "this viewport wants the mobile shell" flag.
     * @returns {boolean}
     */
    function useMobileFlag() {
      const [mobile, setMobile] = React.useState(
        () => !isDisabled() && matchesMobile(),
      );
      React.useEffect(() => {
        const query = window.matchMedia(MOBILE_QUERY);
        const update = () => setMobile(!isDisabled() && query.matches);
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
      }, []);
      return mobile;
    }

    /**
     * The leading header button that opens the navigation drawer.
     * Renders nothing outside a phone-sized viewport, so the desktop header
     * keeps its shipped composition.
     */
    function NavigationButton(props) {
      const mobile = useMobileFlag();
      if (!mobile) return null;
      return h(
        'button',
        {
          type: 'button',
          'data-dsh-mobile-nav': '',
          'aria-label': props.label,
          title: props.label,
          onClick: (event) => {
            event.stopPropagation();
            props.onToggle();
          },
        },
        h(
          'svg',
          {
            width: 20,
            height: 20,
            viewBox: '0 0 20 20',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.8,
            strokeLinecap: 'round',
            'aria-hidden': 'true',
          },
          h('path', { d: 'M3.5 5.5h13' }),
          h('path', { d: 'M3.5 10h9.5' }),
          h('path', { d: 'M3.5 14.5h13' }),
        ),
      );
    }

    return {
      inject: ['slots', 'layout', 'locale'],

      apply(ctx) {
        // ---- locale -------------------------------------------------------
        for (const locale of Object.keys(DICTS)) {
          try {
            ctx.effect(
              () => ctx.locale.register(NS, locale, DICTS[locale]),
              'dsh-mobile-ui: locale ' + locale,
            );
          } catch {
            // A missing dictionary only costs a fallback string.
          }
        }

        const translate = (key) => {
          try {
            const value = ctx.locale.bind(NS)(key);
            if (typeof value === 'string' && value !== key) return value;
          } catch {
            // fall through to the literal
          }
          return FALLBACKS[key] || key;
        };

        // ---- stylesheet ---------------------------------------------------
        ctx.effect(() => {
          const style = document.createElement('style');
          style.id = STYLE_ID;
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'dsh-mobile-ui: styles');

        // ---- viewport flag ------------------------------------------------
        ctx.effect(() => {
          const root = document.documentElement;
          const query = window.matchMedia(MOBILE_QUERY);
          const sync = () => {
            if (!isDisabled() && query.matches) {
              root.setAttribute('data-dsh-mobile', '');
            } else {
              root.removeAttribute('data-dsh-mobile');
            }
          };
          sync();
          query.addEventListener('change', sync);
          return () => {
            query.removeEventListener('change', sync);
            root.removeAttribute('data-dsh-mobile');
          };
        }, 'dsh-mobile-ui: viewport flag');

        // ---- keyboard / visible viewport height ---------------------------
        ctx.effect(() => {
          const root = document.documentElement;
          const viewport = window.visualViewport;
          const sync = () => {
            if (!root.hasAttribute('data-dsh-mobile')) {
              root.style.removeProperty('--dsh-mobile-vv');
              root.style.removeProperty('--dsh-mobile-kb');
              return;
            }
            const height = viewport
              ? Math.round(viewport.height)
              : window.innerHeight;
            root.style.setProperty('--dsh-mobile-vv', `${height}px`);
            const keyboard = viewport
              ? Math.max(
                  0,
                  Math.round(
                    window.innerHeight - viewport.height - viewport.offsetTop,
                  ),
                )
              : 0;
            root.style.setProperty('--dsh-mobile-kb', `${keyboard}px`);
          };
          sync();
          window.addEventListener('resize', sync);
          if (viewport) {
            viewport.addEventListener('resize', sync);
            viewport.addEventListener('scroll', sync);
          }
          return () => {
            window.removeEventListener('resize', sync);
            if (viewport) {
              viewport.removeEventListener('resize', sync);
              viewport.removeEventListener('scroll', sync);
            }
            root.style.removeProperty('--dsh-mobile-vv');
            root.style.removeProperty('--dsh-mobile-kb');
          };
        }, 'dsh-mobile-ui: visible viewport');

        // ---- drawer dismissal --------------------------------------------
        // A tap inside the drawer or on the dimmed conversation closes it, so a
        // session pick never leaves a 280px panel covering the conversation.
        // Menu triggers stay open: their popovers render outside the drawer.
        ctx.effect(() => {
          const MENU_TRIGGER = /(actions|menu)$/i;
          const close = () => {
            if (drawerOpen()) ctx.layout.toggleSidebar();
          };
          const onClick = (event) => {
            if (!document.documentElement.hasAttribute('data-dsh-mobile')) return;
            if (!drawerOpen()) return;
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-dsh-mobile-nav]')) return;
            const button = target.closest('button');
            const label = button ? button.getAttribute('aria-label') || '' : '';
            if (
              label === 'View options' ||
              label === 'Account menu' ||
              MENU_TRIGGER.test(label)
            ) {
              return;
            }
            window.setTimeout(close, 0);
          };
          const onKeyDown = (event) => {
            if (event.key === 'Escape' && drawerOpen()) close();
          };
          document.addEventListener('click', onClick);
          document.addEventListener('keydown', onKeyDown);
          return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKeyDown);
          };
        }, 'dsh-mobile-ui: drawer dismissal');

        // ---- header navigation seat ---------------------------------------
        ctx.slots.inject('conversation.header.leading', () =>
          ctx.slots.register(
            { name: 'conversation.header.leading' },
            () =>
              h(NavigationButton, {
                label: translate('openNavigation'),
                onToggle: () => ctx.layout.toggleSidebar(),
              }),
          ),
        );
      },
    };
  },
});
