/**
 * Mobile patch layer for the Harness Web GUI (browser half).
 *
 * Targets DSH Web 0.2.2+: the shipped shell already handles the phone-sized
 * settings panel, touch row actions, composer keyboard focus and the
 * full-screen right panel. This layer only adds what is still missing:
 * - the 56px rail becomes an overlay drawer;
 * - safe-area padding for the chrome the shipped shell leaves unpadded;
 * - 16px text fields (no iOS focus zoom), swipeable right-panel tabs,
 *   a terminal key row, a full-screen trajectory detail sheet, and long-press
 *   reordering for the shipped HTML5 drag handles;
 * - reading typography and touch target minimums.
 *
 * Everything is additive and gated by `html[data-dsh-mobile]`; a desktop
 * viewport never receives the attribute. `?dsh-mobile=off` disables the
 * layer for one load.
 */
window.__ModuleLoader__.load({
  id: 'dsh-mobile-ui',
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
   Mobile web shell for DSH Web (0.2.2+).

   Every rule is additive and gated by html[data-dsh-mobile]: a desktop
   viewport never receives that attribute. Features the shipped shell
   already handles on phones (full-screen settings, touch row actions,
   the composer keyboard policy, the full-screen right panel) are left
   alone on purpose. \`?dsh-mobile=off\` disables the layer for one load.
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

/* ---- frame ---------------------------------------------------
   The 56px rail leaves the grid, so the conversation owns the width. */
html[data-dsh-mobile] #root > [data-slot="root"] > div:has(> [data-shell-overlay]) {
  grid-template-columns: 0 minmax(0, 1fr) 0 !important;
  transition: none !important;
}

/* Grid children keep explicit seats once the rail leaves the flow. */
html[data-dsh-mobile] #root > [data-slot="root"] > div:has(> [data-shell-overlay]) > div:has(> [data-slot="main"]) {
  grid-column: 2;
  grid-row: 1;
}

html[data-dsh-mobile] #root > [data-slot="root"] > div:has(> [data-shell-overlay]) > div[data-rightbar-col] {
  grid-column: 3;
  grid-row: 1;
}

/* ---- drawer -------------------------------------------------- */
html[data-dsh-mobile] #root > [data-slot="root"] > div > div:has(> [data-slot="sidebar"]) {
  position: fixed !important;
  top: 0;
  left: 0;
  width: min(84vw, 320px) !important;
  height: 100% !important;
  box-sizing: border-box;
  z-index: 60;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
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

/* ---- header -------------------------------------------------- */
html[data-dsh-mobile] [data-slot="conversation.header"] > header {
  padding-top: calc(8px + env(safe-area-inset-top)) !important;
  padding-left: max(8px, env(safe-area-inset-left)) !important;
  /* The far-right seat overhangs the content box on purpose; this keeps the
     right-panel control inside the viewport instead of clipping it. */
  padding-right: max(20px, env(safe-area-inset-right)) !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  min-height: 44px;
}

html[data-dsh-mobile] [data-slot="conversation.header"] > header > div {
  min-width: 0;
}

html[data-dsh-mobile] [data-slot="conversation.header"] > header > div > div {
  flex-wrap: nowrap !important;
}

/* The session/title column gives up width first instead of pushing actions out.
   Anchored to the shipped session-header slot rather than a child index. */
html[data-dsh-mobile] [data-slot="conversation.header"] > header > [data-slot="conversation.session.header"] {
  flex: 1 1 auto !important;
  min-width: 0;
  overflow: hidden;
}

/* Action labels truncate instead of widening the bar. */
html[data-dsh-mobile] [data-slot="conversation.header"] > header button > span {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html[data-dsh-mobile] [data-slot="conversation.header"] button[aria-label*="后台任务"] > span,
html[data-dsh-mobile] [data-slot="conversation.header"] button[aria-label*="background job"] > span {
  max-width: 72px;
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

/* ---- navigation bar for global panels ------------------------ */
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

/* ---- composer / reading -------------------------------------- */
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

html[data-dsh-mobile] body {
  --dsh-content-font-size: 16px !important;
  --dsh-code-font-size: 13.5px !important;
}

/* Model selector: keep the name readable instead of collapsing to an icon
   as early as the shipped measuring would. The version tag goes away. */
html[data-dsh-mobile] [data-conversation-region="composer"] ._7KE1Ra_trigger {
  max-width: min(360px, 60cqw) !important;
}

html[data-dsh-mobile] [data-conversation-region="composer"] ._7KE1Ra_triggerLabel [data-tone],
html[data-dsh-mobile] [data-conversation-region="composer"] [data-slot="conversation.input.model.label"] [data-tone] {
  display: none !important;
}

/* Composer statistics: keep both pills, drop decorative icons and tighten
   the type so the numbers are not ellipsised. */
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

/* Touch targets: comfortable minimums, with the compact split chip and the
   composer's round controls exempted so their geometry stays intact. */
@media (hover: none) {
  html[data-dsh-mobile] [data-slot="sidebar"] button,
  html[data-dsh-mobile] [data-slot="conversation.header"] button {
    min-height: 36px;
  }

  html[data-dsh-mobile] [data-slot="conversation.header"] [data-open-target="directory"] {
    width: 24px !important;
    height: 24px !important;
    min-height: 24px !important;
  }

  html[data-dsh-mobile] [data-slot="conversation.header"] [data-open-target="directory"] > button {
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
    justify-content: center !important;
  }

  html[data-dsh-mobile] [data-conversation-region="composer"] .uV2eYG_add,
  html[data-dsh-mobile] [data-conversation-region="composer"] .uV2eYG_primary {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    padding: 0 !important;
  }
}

/* Header subagent counter: keep the icon, drop the label. */
html[data-dsh-mobile] .ZKlsPq_trigger {
  width: 28px !important;
  padding: 0 !important;
  gap: 0 !important;
  justify-content: center !important;
}

html[data-dsh-mobile] .ZKlsPq_trigger > span {
  display: none !important;
}

/* ---- safe areas for the shipped chrome ----------------------- */
/* Modal layer: keep dialogs off the notch and the home indicator. */
html[data-dsh-mobile] div:has(> [role="dialog"][aria-modal="true"]):not(:has(> .VOzbGW_panel)) {
  padding-top: max(16px, env(safe-area-inset-top)) !important;
  padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
  padding-left: max(16px, env(safe-area-inset-left)) !important;
  padding-right: max(16px, env(safe-area-inset-right)) !important;
}

html[data-dsh-mobile] [role="dialog"][aria-modal="true"]:not(.VOzbGW_panel) {
  /* vh fallback for browsers without dynamic viewport units. */
  max-height: calc(100vh - max(16px, env(safe-area-inset-top)) - max(16px, env(safe-area-inset-bottom))) !important;
  max-height: calc(100dvh - max(16px, env(safe-area-inset-top)) - max(16px, env(safe-area-inset-bottom))) !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
}

/* Toasts are fixed at the top; move them below the notch. */
html[data-dsh-mobile] [class*="_toast_"] {
  top: calc(40px + env(safe-area-inset-top)) !important;
  max-width: min(640px, calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right))) !important;
}

/* Right panel: full-screen strip clears the notch and the home indicator. */
html[data-dsh-mobile] [data-dockkit-strip] {
  padding-top: calc(10px + env(safe-area-inset-top)) !important;
}

html[data-dsh-mobile] [data-sidebar-right-session] [data-dockkit-pane] {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Settings keeps the shipped full-screen panel; only safe-area padding is ours. */
html[data-dsh-mobile] .VOzbGW_panel {
  box-sizing: border-box !important;
  padding-top: env(safe-area-inset-top) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
}

/* ---- touch typing -------------------------------------------- */
/* iOS zooms any focused text field below 16px. Force the minimum once, for
   every field; the shipped 16px overrides stay valid. */
html[data-dsh-mobile] input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="hidden"]):not([type="file"]):not([type="color"]):not([type="button"]):not([type="submit"]):not([type="reset"]),
html[data-dsh-mobile] textarea {
  font-size: 16px !important;
}

/* ---- right-panel tab strip ----------------------------------- */
/* The strip disables touch panning for its drag gesture; on a phone
   horizontal swiping matters more than reordering tabs. */
html[data-dsh-mobile] [data-dockkit-strip],
html[data-dsh-mobile] [data-dockkit-strip-tabs] {
  touch-action: pan-x !important;
}

html[data-dsh-mobile] [data-dockkit-strip] button {
  min-width: 28px;
  min-height: 28px;
}

/* The shipped tab close is a 20px box pinned 4px in from the 28px tab's top
   and right edges. Growing it to the 28px touch minimum pushes the glyph 4px
   down and 4px left — out of the tab's optical centre and past its bottom
   edge. Pin the grown box to the tab edges instead: the 14px glyph lands on
   the shipped pixel, only the hit area grows. */
html[data-dsh-mobile] [data-dockkit-strip] [data-dockkit-tab-close] {
  top: 0 !important;
  right: 0 !important;
}

/* ---- trajectory: the shipped 92% sheet, plus safe-area padding ---- */
/* DSH 0.2.2 already turns the event details into a 92%-wide overlay below
   760px; layout stays official, only the notch/home-indicator padding is ours. */
html[data-dsh-mobile] .Y0dWHa_details {
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ---- terminal: phone key bar -------------------------------- */
html[data-dsh-mobile] [data-sidebar-terminal] {
  position: relative;
  box-sizing: border-box;
  padding-bottom: calc(44px + env(safe-area-inset-bottom));
}

html[data-dsh-mobile] [data-dsh-mobile-keys] {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 6px;
  height: calc(40px + env(safe-area-inset-bottom));
  padding: 2px 8px env(safe-area-inset-bottom);
  box-sizing: border-box;
  background: var(--dsw-specific-sidebar-fill);
  border-top: 0.5px solid var(--dsw-alias-border-l1);
  overflow-x: auto;
  scrollbar-width: none;
}

html[data-dsh-mobile] [data-dsh-mobile-keys]::-webkit-scrollbar {
  display: none;
}

html[data-dsh-mobile] [data-dsh-mobile-keys] button {
  flex: none;
  min-width: 40px;
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

html[data-dsh-mobile] [data-dsh-mobile-keys] button[data-armed] {
  background: var(--dsw-alias-state-business-primary);
  color: #fff;
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


        // ---- drawer dismissal --------------------------------------------
        // The drawer stays open for in-place interactions (search, menus,
        // workspace dialogs) and closes when a tap lands outside it or when
        // navigation actually happens: another Session or another main panel.
        ctx.effect(() => {
          const root = document.documentElement;
          const isMobile = () => root.hasAttribute('data-dsh-mobile');
          const closeDrawer = () => {
            // Observers below fire on desktop too: a Session load or a main-panel
            // switch must not collapse the desktop sidebar, only a phone drawer.
            if (!isMobile() || !drawerOpen()) return;
            ctx.layout.toggleSidebar();
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


        // ---- compact running-jobs pill ------------------------------------
        // The shipped pill label is a sentence ("2 个后台任务运行中") and, on a
        // phone, it is the widest thing in the header row: it squeezes the
        // Session title down to a single character. Keep the sentence in
        // `aria-label` and rewrite only the visible text node to its count while
        // the mobile shell is on, so the chip reads icon + number. React owns that
        // text node, so it is edited in place and every header mutation
        // re-normalizes it; turning the mobile shell off restores the sentence.
        ctx.effect(() => {
          const root = document.documentElement;
          const TRIGGER =
            '[data-slot="conversation.header"] button[aria-label*="后台任务"], ' +
            '[data-slot="conversation.header"] button[aria-label*="background job"]';

          const normalize = (button, mobile) => {
            const span = button.querySelector(':scope > span');
            const label = button.getAttribute('aria-label') || '';
            if (span === null || label === '') return;
            const text = span.firstChild;
            if (text === null || text.nodeType !== Node.TEXT_NODE) return;
            const match = label.match(/\d+/);
            const next = mobile && match !== null ? match[0] : label;
            if (text.nodeValue !== next) text.nodeValue = next;
          };

          const normalizeHeader = (mobile) => {
            for (const button of document.querySelectorAll(TRIGGER)) {
              normalize(button, mobile);
            }
          };

          const observer = new MutationObserver((records) => {
            let touched = false;
            for (const record of records) {
              let target = record.target;
              if (target instanceof Text) target = target.parentNode;
              if (
                target instanceof Element &&
                target.closest('[data-slot="conversation.header"]') !== null
              ) {
                touched = true;
                break;
              }
            }
            if (touched) normalizeHeader(root.hasAttribute('data-dsh-mobile'));
          });
          observer.observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true,
          });

          const query = window.matchMedia(MOBILE_QUERY);
          const sync = () => normalizeHeader(root.hasAttribute('data-dsh-mobile'));
          query.addEventListener('change', sync);
          sync();
          return () => {
            observer.disconnect();
            query.removeEventListener('change', sync);
            normalizeHeader(false);
          };
        }, 'dsh-mobile-ui: compact jobs pill');

        // ---- input focus reveal -------------------------------------------
        // Text fields outside the composer (settings, plugin install, model
        // keys, automation) live in fixed panels; once the soft keyboard opens
        // the focused field can end up behind it. Bring it back after the
        // keyboard settles, but only when it is actually out of view.
        ctx.effect(() => {
          const root = document.documentElement;
          let timer = null;
          const onFocusIn = (event) => {
            if (!root.hasAttribute('data-dsh-mobile')) return;
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-conversation-region="composer"]')) return;
            if (!target.matches('input, textarea, [contenteditable="true"]')) return;
            if (timer !== null) window.clearTimeout(timer);
            timer = window.setTimeout(() => {
              timer = null;
              if (!root.hasAttribute('data-dsh-mobile') || !target.isConnected) return;
              const rect = target.getBoundingClientRect();
              const viewport = window.visualViewport;
              const height = viewport ? viewport.height : window.innerHeight;
              if (rect.top >= 8 && rect.bottom <= height - 8) return;
              target.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 380);
          };
          document.addEventListener('focusin', onFocusIn, true);
          return () => {
            document.removeEventListener('focusin', onFocusIn, true);
            if (timer !== null) window.clearTimeout(timer);
          };
        }, 'dsh-mobile-ui: input focus reveal');

        // ---- terminal key bar ---------------------------------------------
        // xterm has no phone modifier row: without Ctrl/Esc/Tab/arrows a
        // terminal is barely usable from a touch keyboard. The bar dispatches
        // the same keyboard events xterm already listens for, and Ctrl is
        // sticky: arm it, then type the letter on the native keyboard.
        ctx.effect(() => {
          const root = document.documentElement;
          let bar = null;
          let armed = false;
          let timer = null;

          const makeKey = (init, keyCode) => {
            const event = new KeyboardEvent('keydown', Object.assign({
              bubbles: true,
              cancelable: true,
            }, init));
            try {
              Object.defineProperty(event, 'keyCode', { get: () => keyCode });
              Object.defineProperty(event, 'which', { get: () => keyCode });
            } catch {
              // keyCode is advisory for xterm; key/code still carry the intent.
            }
            return event;
          };

          const dispatch = (host, key, code, keyCode, ctrlKey) => {
            const area = host.querySelector('textarea.xterm-helper-textarea');
            if (!area) return;
            area.dispatchEvent(makeKey({ key, code, ctrlKey }, keyCode));
          };

          const renderArmed = () => {
            if (bar === null) return;
            const button = bar.querySelector('[data-key="ctrl"]');
            if (button === null) return;
            if (armed) button.setAttribute('data-armed', '');
            else button.removeAttribute('data-armed');
          };

          const build = (host) => {
            const next = document.createElement('div');
            next.setAttribute('data-dsh-mobile-keys', '');
            const keys = [
              ['esc', 'Esc', 'Escape', 'Escape', 27],
              ['tab', 'Tab', 'Tab', 'Tab', 9],
              ['up', '\u2191', 'ArrowUp', 'ArrowUp', 38],
              ['down', '\u2193', 'ArrowDown', 'ArrowDown', 40],
              ['left', '\u2190', 'ArrowLeft', 'ArrowLeft', 37],
              ['right', '\u2192', 'ArrowRight', 'ArrowRight', 39],
              ['ctrl', 'Ctrl', '', '', 17],
            ];
            for (const [id, label, key, code, keyCode] of keys) {
              const button = document.createElement('button');
              button.type = 'button';
              button.dataset.key = id;
              button.textContent = label;
              button.setAttribute('aria-label', id === 'ctrl' ? 'Ctrl (sticky)' : label);
              button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (id === 'ctrl') {
                  armed = !armed;
                  renderArmed();
                  return;
                }
                dispatch(host, key, code, keyCode, false);
              });
              next.appendChild(button);
            }
            return next;
          };

          const onKeyDown = (event) => {
            if (!armed) return;
            const area = event.target;
            if (!(area instanceof HTMLTextAreaElement)) return;
            if (!area.classList.contains('xterm-helper-textarea')) return;
            armed = false;
            renderArmed();
            event.preventDefault();
            event.stopImmediatePropagation();
            area.dispatchEvent(makeKey({ key: event.key, code: event.code, ctrlKey: true }, event.keyCode));
          };

          const sync = () => {
            const mobile = root.hasAttribute('data-dsh-mobile');
            const host = document.querySelector('[data-sidebar-terminal]');
            const visible = host !== null && host.getClientRects().length > 0;
            if (!mobile || !visible) {
              if (bar !== null) {
                bar.remove();
                bar = null;
                armed = false;
              }
              return;
            }
            if (bar !== null && host.contains(bar)) return;
            if (bar !== null) bar.remove();
            bar = build(host);
            host.appendChild(bar);
            renderArmed();
          };

          timer = window.setInterval(sync, 500);
          document.addEventListener('keydown', onKeyDown, true);
          const query = window.matchMedia(MOBILE_QUERY);
          query.addEventListener('change', sync);
          sync();
          return () => {
            window.clearInterval(timer);
            document.removeEventListener('keydown', onKeyDown, true);
            query.removeEventListener('change', sync);
            if (bar !== null) bar.remove();
          };
        }, 'dsh-mobile-ui: terminal keys');

        // ---- touch reorder ------------------------------------------------
        // HTML5 drag-and-drop does not follow a finger (iOS Safari has no
        // native drag). A long press on a shipped draggable handle replays the
        // drag protocol as synthetic DragEvents, so the shipped reorder
        // handlers (model list, Session/Workspace list) run unchanged.
        ctx.effect(() => {
          const root = document.documentElement;
          const dragSupported = typeof DragEvent !== 'undefined' && typeof DataTransfer !== 'undefined';
          let hold = null;
          let source = null;
          let transfer = null;
          let active = false;
          let startX = 0;
          let startY = 0;
          let suppressClickUntil = 0;

          const cleanup = () => {
            if (hold !== null) {
              window.clearTimeout(hold);
              hold = null;
            }
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp, true);
            window.removeEventListener('pointercancel', onCancel, true);
            window.removeEventListener('touchmove', onTouchMove);
            source = null;
            transfer = null;
            active = false;
          };

          const makeDrag = (type, event, node) => {
            if (node === null || transfer === null) return;
            try {
              node.dispatchEvent(new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                dataTransfer: transfer,
                clientX: event.clientX,
                clientY: event.clientY,
              }));
            } catch {
              // A browser without DataTransfer construction support disables
              // touch reordering; everything else keeps working.
            }
          };

          // A dropped item must not also count as a tap on the row.
          const onClickCapture = (event) => {
            if (Date.now() >= suppressClickUntil) return;
            event.preventDefault();
            event.stopPropagation();
          };

          const rowAt = (x, y) => {
            const element = document.elementFromPoint(x, y);
            if (!(element instanceof Element)) return null;
            return element.closest('[data-row-key], [draggable="true"]');
          };

          const onTouchMove = (event) => {
            if (active) event.preventDefault();
          };

          const onMove = (event) => {
            if (!active) {
              if (hold === null) return;
              if (Math.hypot(event.clientX - startX, event.clientY - startY) > 8) cleanup();
              return;
            }
            event.preventDefault();
            const next = rowAt(event.clientX, event.clientY);
            if (next === null) return;
            makeDrag('dragenter', event, next);
            makeDrag('dragover', event, next);
          };

          const onUp = (event) => {
            if (!active) {
              cleanup();
              return;
            }
            const next = rowAt(event.clientX, event.clientY);
            if (next !== null && next !== source) {
              makeDrag('dragenter', event, next);
              makeDrag('dragover', event, next);
              makeDrag('drop', event, next);
            }
            if (source !== null) makeDrag('dragend', event, source);
            suppressClickUntil = Date.now() + 500;
            cleanup();
          };

          const onCancel = () => {
            if (active) suppressClickUntil = Date.now() + 500;
            if (active && source !== null && transfer !== null) {
              source.dispatchEvent(new DragEvent('dragend', {
                bubbles: true,
                cancelable: true,
                dataTransfer: transfer,
              }));
            }
            cleanup();
          };

          const onPointerDown = (event) => {
            if (!dragSupported || !root.hasAttribute('data-dsh-mobile')) return;
            if (event.pointerType === 'mouse') return;
            const element = event.target;
            if (!(element instanceof Element)) return;
            if (element.closest('input, textarea, [contenteditable="true"]')) return;
            if (element.closest('[data-conversation-region="composer"]')) return;
            const handle = element.closest('[draggable="true"]');
            if (handle === null) return;
            startX = event.clientX;
            startY = event.clientY;
            source = handle;
            hold = window.setTimeout(() => {
              hold = null;
              try {
                transfer = new DataTransfer();
              } catch {
                cleanup();
                return;
              }
              active = true;
              window.addEventListener('pointermove', onMove, { passive: false });
              window.addEventListener('pointerup', onUp, true);
              window.addEventListener('pointercancel', onCancel, true);
              window.addEventListener('touchmove', onTouchMove, { passive: false });
              makeDrag('dragstart', event, handle);
            }, 450);
          };

          document.addEventListener('pointerdown', onPointerDown, true);
          document.addEventListener('click', onClickCapture, true);
          return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('click', onClickCapture, true);
            cleanup();
          };
        }, 'dsh-mobile-ui: touch reorder');

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
