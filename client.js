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
      backToConversation: 'Back to chat',
    };

    const DICTS = {
      zh: { openNavigation: '打开导航', backToConversation: '回到对话' },
      en: { openNavigation: 'Open navigation', backToConversation: 'Back to chat' },
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

/* The fixed sidebar leaves the grid flow, so every remaining column keeps an
   explicit seat instead of being auto-placed one column to the left. */
html[data-dsh-mobile] #root > [data-slot="root"] > div:has(> [data-shell-overlay]) > div:has(> [data-slot="main"]) {
  grid-column: 2;
  grid-row: 1;
}

html[data-dsh-mobile] #root > [data-slot="root"] > div:has(> [data-shell-overlay]) > div[data-rightbar-col] {
  grid-column: 3;
  grid-row: 1;
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

/* Global panels (Plugins, Automation tasks) replace the conversation header,
   so they get a bottom bar with the way back instead of the floating seat. */
html[data-dsh-mobile] [data-dsh-mobile-panel-bar] {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: calc(52px + env(safe-area-inset-bottom));
  padding: 0 8px env(safe-area-inset-bottom);
  box-sizing: border-box;
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  background: var(--dsw-specific-sidebar-fill);
  pointer-events: auto;
}

/* A main panel that is not the conversation owns the view. */
html[data-dsh-mobile]:has([data-slot="main"] > *:not([data-slot="main.conversation"])) [data-dsh-mobile-panel-bar] {
  display: flex;
}

html[data-dsh-mobile] #root > [data-slot="root"] > div:not([data-sidebar-collapsed]) [data-dsh-mobile-panel-bar] {
  display: none;
}

html[data-dsh-mobile] [data-dsh-mobile-panel-bar] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

html[data-dsh-mobile] [data-dsh-mobile-panel-bar] button:active {
  background: var(--dsw-alias-bg-layer-2);
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

/* ------------------------------------------------------------
   Version-tied selectors.
   The names below are generated by the installed DSH client
   build. If an upgrade renames them these rules simply stop
   matching; the rest of the mobile shell keeps working.
   ------------------------------------------------------------ */

/* Settings dialog: full-screen sheet with the section list as a horizontal
   strip. The shipped two-column dialog leaves the option column 154px wide
   on a phone. */
html[data-dsh-mobile] .VOzbGW_panel {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: var(--dsh-mobile-vv, 100%) !important;
  max-width: none !important;
  max-height: none !important;
  border-radius: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

html[data-dsh-mobile] .VOzbGW_nav {
  width: 100% !important;
  height: auto !important;
  flex: none !important;
  padding: 10px 14px 0 !important;
  border-right: 0 !important;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
}

html[data-dsh-mobile] .VOzbGW_navTitle {
  padding: 0 2px 10px !important;
  font-size: 17px !important;
}

html[data-dsh-mobile] .VOzbGW_navList {
  display: flex !important;
  flex-direction: row !important;
  gap: 6px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  padding-bottom: 10px !important;
  scrollbar-width: none;
}

html[data-dsh-mobile] .VOzbGW_navList::-webkit-scrollbar {
  display: none;
}

html[data-dsh-mobile] .VOzbGW_navCell {
  flex: none !important;
  width: auto !important;
  height: 34px !important;
  padding: 0 12px !important;
  border-radius: 999px !important;
  white-space: nowrap;
}

html[data-dsh-mobile] .VOzbGW_content {
  width: 100% !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

html[data-dsh-mobile] .VOzbGW_header {
  position: absolute !important;
  top: calc(env(safe-area-inset-top) + 8px) !important;
  right: 10px !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
}

html[data-dsh-mobile] .VOzbGW_options {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  padding: 8px 16px calc(24px + env(safe-area-inset-bottom)) !important;
}

/* Settings → Appearance: three theme cubes side by side instead of a
   full-width stack. */
html[data-dsh-mobile] ._8HJdBW_cubeRow {
  gap: 8px !important;
}

html[data-dsh-mobile] ._8HJdBW_themeCube {
  flex: 1 1 0 !important;
  width: auto !important;
  min-width: 0 !important;
}

/* Composer dock: keep the context meter, drop the two generation
   statistics pills that crowd a 390px row. */
html[data-dsh-mobile] [data-composer-seat] .bOPqQW_anchor {
  display: none;
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
     * The navigation glyph shared by both drawer triggers.
     */
    function NavigationGlyph() {
      return h(
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
      );
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
        h(NavigationGlyph),
      );
    }

    /**
     * Global panels (Plugins, Automation tasks) replace the conversation
     * header, so they keep a bottom bar with the way back to the drawer.
     * Visibility is CSS-driven from the selected main panel.
     */
    function PanelNavigationBar(props) {
      const mobile = useMobileFlag();
      if (!mobile) return null;
      return h(
        'div',
        { 'data-dsh-mobile-panel-bar': '' },
        h(
          'button',
          {
            type: 'button',
            'data-dsh-mobile-panel-nav': '',
            'aria-label': props.navigationLabel,
            onClick: (event) => {
              event.stopPropagation();
              props.onOpenDrawer();
            },
          },
          h(NavigationGlyph),
          h('span', null, props.navigationLabel),
        ),
        h(
          'button',
          {
            type: 'button',
            'data-dsh-mobile-panel-back': '',
            'aria-label': props.backLabel,
            onClick: (event) => {
              event.stopPropagation();
              props.onBackToConversation();
            },
          },
          h('span', null, props.backLabel),
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
            if (target.closest('[data-dsh-mobile-nav], [data-dsh-mobile-panel-nav]')) return;
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

        // ---- bottom navigation for global panels ---------------------------
        ctx.slots.inject('shell.bottom', () =>
          ctx.slots.register(
            { name: 'shell.bottom' },
            () =>
              h(PanelNavigationBar, {
                navigationLabel: translate('openNavigation'),
                backLabel: translate('backToConversation'),
                onOpenDrawer: () => ctx.layout.toggleSidebar(),
                onBackToConversation: () => ctx.layout.selectPanel(null),
              }),
          ),
        );

      },
    };
  },
});
