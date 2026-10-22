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
  /* The far-right seat overhangs the content box by 16px on purpose, so the
     right padding keeps it inside the viewport instead of clipping the
     right-panel control. */
  padding-right: 20px !important;
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
  /* The far-right seat overhangs the content box by 16px on purpose, so the
     right padding keeps it inside the viewport instead of clipping the
     right-panel control. */
  padding-right: 20px !important;
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

/* Touch devices: the shipped session rows reveal their actions only on hover,
   which never happens on a phone. Keep just the overflow menu visible so
   rename/archive/pin stay reachable. */
@media (hover: none) {
  html[data-dsh-mobile] [data-slot="sidebar.workspaces"] [data-row-key^="session:"] > :has(button),
  html[data-dsh-mobile] [data-slot="sidebar.workspaces"] [data-row-key^="workspace:"] > :has(button) {
    display: inline-flex !important;
    padding-left: 2px;
  }

  /* The relative time is the sibling just before the actions; dropping it keeps
     the row from reading like a truncated timestamp. */
  html[data-dsh-mobile] [data-slot="sidebar.workspaces"] [data-row-key^="session:"] > :nth-last-child(2) {
    display: none !important;
  }

  html[data-dsh-mobile] [data-slot="sidebar.workspaces"] [data-row-key^="session:"] > :has(button) > :nth-child(n + 2) {
    display: none !important;
  }
}

/* Model selector: the trigger is capped at 45% of the control row, which
   truncates "DeepSeek-V4.1-Flash" on a phone. The version tag goes away and the
   cap moves to 60%, which still fits the row's own compact measuring. */
html[data-dsh-mobile] [data-conversation-region="composer"] ._7KE1Ra_trigger {
  max-width: min(360px, 60cqw) !important;
}

html[data-dsh-mobile] [data-conversation-region="composer"] ._7KE1Ra_triggerLabel [data-tone],
html[data-dsh-mobile] [data-conversation-region="composer"] [data-slot="conversation.input.model.label"] [data-tone] {
  display: none !important;
}

/* Composer tool row: reclaim the few pixels the model name needs so the
   shipped compact measuring keeps the text instead of collapsing to an icon. */
html[data-dsh-mobile] [data-conversation-region="composer"] .uV2eYG_row {
  padding-left: 6px !important;
  padding-right: 6px !important;
  gap: 8px !important;
}

/* Composer dock statistics: the two pills stay visible (a user on Work details
   = Detailed expects them); drop their decorative icons, tighten the row and
   shrink the type a little so the numbers are not ellipsised. */
html[data-dsh-mobile] [data-composer-seat] .bOPqQW_pill > svg {
  display: none !important;
}

html[data-dsh-mobile] [data-composer-seat] .bOPqQW_pill {
  font-size: 12px !important;
  padding-left: 6px !important;
  padding-right: 6px !important;
  gap: 0 !important;
}

html[data-dsh-mobile] [data-composer-seat] .uV2eYG_dock {
  gap: 6px !important;
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
  html[data-dsh-mobile] [data-slot="conversation.header"] button {
    min-height: 36px;
  }

  /* The composer's round controls keep a square box, otherwise a min-height
     rule turns them into ovals. */
  html[data-dsh-mobile] [data-conversation-region="composer"] .uV2eYG_add,
  html[data-dsh-mobile] [data-conversation-region="composer"] .uV2eYG_primary {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    padding: 0 !important;
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

/* Conversation header on a phone: the subagent counter keeps its icon but
   drops the text label, so the right-panel control stays inside the frame. */
html[data-dsh-mobile] .ZKlsPq_trigger {
  width: 28px !important;
  padding: 0 !important;
  gap: 0 !important;
  justify-content: center !important;
}

html[data-dsh-mobile] .ZKlsPq_trigger > span {
  display: none !important;
}

html[data-dsh-mobile] .wSkVaW_titleCluster {
  min-width: 0 !important;
}

html[data-dsh-mobile] .wSkVaW_crumbs {
  min-width: 0 !important;
}

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
        // The drawer stays open for in-place interactions (search, menus,
        // workspace dialogs) and closes when a tap lands outside it or when
        // navigation actually happens: another Session or another main panel.
        ctx.effect(() => {
          const root = document.documentElement;
          const isMobile = () => root.hasAttribute('data-dsh-mobile');
          const closeDrawer = () => {
            if (drawerOpen()) ctx.layout.toggleSidebar();
          };

          const onClick = (event) => {
            if (!isMobile() || !drawerOpen()) return;
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-dsh-mobile-nav], [data-dsh-mobile-panel-nav]')) return;
            // Picking a Session row is navigation even when it is already open;
            // workspace rows only expand or collapse and keep the drawer.
            // Controls inside the row (the "..." menu, hover actions) are
            // in-place actions: keep the drawer so their menu stays in context.
            if (target.closest('[data-slot="sidebar.workspaces"] [data-row-key^="session:"]')) {
              if (target.closest('button')) return;
              window.setTimeout(closeDrawer, 0);
              return;
            }
            // Menu items render in a body portal; acting on one is still an
            // in-place operation, so the list stays where the user left it.
            if (target.closest('[role="menu"]')) return;
            if (target.closest('[data-slot="sidebar"]')) {
              // Only a button press navigates: brand / New Session / panel rows
              // collapse the drawer immediately. Text and blank areas inside the
              // drawer (workspace rows, search field, empty space) are in-place
              // interactions and keep it.
              const button = target.closest('button');
              if (
                button !== null &&
                button.closest(
                  '[data-slot="sidebar.workspaces"], [data-slot="sidebar.settings"], [data-slot="sidebar.footer.action"]',
                ) === null
              ) {
                window.setTimeout(closeDrawer, 0);
              }
              return;
            }
            window.setTimeout(closeDrawer, 0);
          };

          const onKeyDown = (event) => {
            if (event.key !== 'Escape' || !isMobile()) return;
            // Esc closes an open popover first; the drawer stays behind it.
            if (document.querySelector('[role="menu"], [role="listbox"]')) return;
            closeDrawer();
          };

          // A Session switch (including the blank New Session state) closes it.
          const sessionObserver = new MutationObserver(closeDrawer);
          sessionObserver.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['data-conversation-session'],
          });

          // A main-panel switch (Plugins, Automation tasks) closes it too.
          let panelObserver = null;
          let observedPanel = null;
          const attachPanelObserver = () => {
            const slot = document.querySelector('[data-slot="main"]');
            if (slot === observedPanel) return;
            if (panelObserver) panelObserver.disconnect();
            observedPanel = slot;
            if (!slot) return;
            panelObserver = new MutationObserver(closeDrawer);
            panelObserver.observe(slot, { childList: true });
          };
          const bodyObserver = new MutationObserver(attachPanelObserver);
          bodyObserver.observe(document.body, { childList: true });
          attachPanelObserver();

          document.addEventListener('click', onClick, true);
          // Capture phase: the shipped menu closes on Escape from its own React
          // handler, so the menu must still be visible when we inspect it.
          document.addEventListener('keydown', onKeyDown, true);
          return () => {
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKeyDown, true);
            sessionObserver.disconnect();
            if (panelObserver) panelObserver.disconnect();
            bodyObserver.disconnect();
          };
        }, 'dsh-mobile-ui: drawer dismissal');

        // ---- drawer closes on a new Session -------------------------------
        // Creating a Session swaps the conversation DOM node, so the attribute
        // observer above sees no mutation. While the drawer is open, watch the
        // conversation identity directly and close once it changes.
        ctx.effect(() => {
          const root = document.documentElement;
          let lastSession = null;
          const readSession = () => {
            const node = document.querySelector('[data-conversation-session]');
            return node ? node.getAttribute('data-conversation-session') : null;
          };
          const timer = window.setInterval(() => {
            const current = readSession();
            const mobile = root.hasAttribute('data-dsh-mobile');
            if (mobile && drawerOpen() && current !== lastSession) {
              ctx.layout.toggleSidebar();
            }
            lastSession = current;
          }, 120);
          return () => window.clearInterval(timer);
        }, 'dsh-mobile-ui: new-session drawer close');

        // ---- composer focus guard -----------------------------------------
        // The shipped composer focuses itself on Session switches and on the
        // first paint. On a phone that pops the soft keyboard without the user
        // asking for it, so drop focus that no tap preceded.
        ctx.effect(() => {
          const root = document.documentElement;
          const ADD_MENU = '[class*="_3e4SsG_menu"]';
          let lastComposerPointer = 0;
          let lastComposerButton = 0;
          let buttonFocusedEditor = false;

          const insideComposer = (node) =>
            node instanceof Element &&
            node.closest('[data-conversation-region="composer"]') !== null;

          const isEditor = (node) =>
            node instanceof Element &&
            (node.isContentEditable || node.tagName === 'TEXTAREA') &&
            insideComposer(node);

          const blurEditor = () => {
            const editor = document.querySelector(
              '[data-conversation-region="composer"] [contenteditable="true"]',
            );
            if (editor !== null && document.activeElement === editor) editor.blur();
          };

          const markPointer = (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('button')) {
              if (insideComposer(target)) lastComposerButton = Date.now();
              return;
            }
            if (insideComposer(target)) lastComposerPointer = Date.now();
          };

          const onFocusIn = (event) => {
            if (!root.hasAttribute('data-dsh-mobile')) return;
            const editor = event.target;
            if (!isEditor(editor)) return;
            // A tap on the editor itself: the user wants to type.
            if (Date.now() - lastComposerPointer < 900) return;
            // Buttons like "+" focus the editor only so their popover can mount.
            // Keep the focus until that click is handled, then drop it in the very
            // next task: the popover survives, the soft keyboard does not.
            if (Date.now() - lastComposerButton < 1200) {
              buttonFocusedEditor = true;
              window.setTimeout(() => {
                if (buttonFocusedEditor) {
                  buttonFocusedEditor = false;
                  blurEditor();
                }
              }, 350);
              return;
            }
            // Focus nobody asked for (session switch, first paint): drop it.
            editor.blur();
          };

          // Runs before React's handlers; the deferred blur still happens after
          // the click has opened its popover.
          const onClick = (event) => {
            if (!root.hasAttribute('data-dsh-mobile') || !buttonFocusedEditor) return;
            const target = event.target;
            if (!(target instanceof Element)) return;
            const button = target.closest('button');
            if (button === null || !insideComposer(button)) return;
            buttonFocusedEditor = false;
            window.setTimeout(blurEditor, 0);
          };

          // A tap on the editor while the "+" panel is open means "let me type":
          // close the panel first (its Escape handler lives on the editor).
          const onEditorPointerDown = (event) => {
            if (!root.hasAttribute('data-dsh-mobile')) return;
            const target = event.target;
            if (!isEditor(target)) return;
            if (document.querySelector(ADD_MENU) === null) return;
            target.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                bubbles: true,
                cancelable: true,
              }),
            );
          };

          document.addEventListener('pointerdown', markPointer, true);
          document.addEventListener('touchstart', markPointer, true);
          document.addEventListener('pointerdown', onEditorPointerDown, true);
          document.addEventListener('focusin', onFocusIn, true);
          document.addEventListener('click', onClick, true);
          return () => {
            document.removeEventListener('pointerdown', markPointer, true);
            document.removeEventListener('touchstart', markPointer, true);
            document.removeEventListener('pointerdown', onEditorPointerDown, true);
            document.removeEventListener('focusin', onFocusIn, true);
            document.removeEventListener('click', onClick, true);
          };
        }, 'dsh-mobile-ui: composer focus guard');

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
