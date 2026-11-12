/**
 * Mobile patch layer for the Harness Web GUI (browser half).
 *
 * Targets DSH Web 0.2.2-alpha.3+, verified against 0.2.2-rc.2. 0.2.2-alpha.3
 * already ships the phone navigation this layer used to draw itself: the
 * overlay drawer below 768px, its opener in the frame leading seat, the mask,
 * the Escape / Session / panel dismissal and the global-panel top inset. The
 * old custom drawer, header hamburger and panel bottom bar are therefore gone —
 * a second drawer only fought the shipped one.
 *
 * What remains are the gaps the shipped chrome still leaves:
 * - safe-area padding for the drawer, conversation header, global panels,
 *   composer, modals, toasts, the right panel strip, the settings panel and
 *   the trajectory sheet;
 * - reading typography, 16px text fields (no iOS focus zoom) and touch-sized
 *   chrome;
 * - a compact running-jobs pill and subagent counter, so the header keeps a
 *   usable title on a phone;
 * - swipeable right-panel tabs, a terminal key row, and long-press reordering
 *   for the shipped HTML5 drag handles.
 *
 * Everything is additive and gated by `html[data-dsh-mobile]`; a desktop
 * viewport never receives the attribute. `?dsh-mobile=off` disables the layer
 * for one load.
 */
window.__ModuleLoader__.load({
  id: 'dsh-mobile-ui',
  factory() {
    const STYLE_ID = 'dsh-mobile-ui/styles';
    const MOBILE_QUERY = '(max-width: 767px)';

    const CSS = `
/* ============================================================
   Mobile web shell for DSH Web (0.2.2-alpha.3+).

   Every rule is additive and gated by html[data-dsh-mobile]: a desktop
   viewport never receives that attribute. The shipped shell owns the phone
   drawer and its dismissal; this layer owns the safe areas the shipped chrome
   still leaves to the browser edge, plus a few dense phone affordances.
   \`?dsh-mobile=off\` disables the layer for one load.
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

/* ---- safe areas: frame chrome --------------------------------
   The shipped phone drawer (below 768px) is a full-height sheet flush with
   the left edge; its content clears the notch and the home indicator. */
html[data-dsh-mobile] [data-sidebar-drawer] > div:has(> [data-slot="sidebar"]) {
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* The sidebar component writes its own inline width; clamp it to the inset
   content box so a landscape notch cannot clip its trailing controls. */
html[data-dsh-mobile] [data-sidebar-drawer] > div:has(> [data-slot="sidebar"]) [data-slot="sidebar"] > * {
  max-width: 100%;
}

/* The shipped opener sits in the frame leading seat at 12/11. */
html[data-dsh-mobile]:not([data-platform]):not([data-windows-titlebar]) [data-sidebar-drawer] [data-shell-leading] {
  top: calc(11px + env(safe-area-inset-top));
  left: calc(12px + env(safe-area-inset-left));
}

/* The conversation title row derives its inset from the same variable that
   publishes the opener's leading clearance (48px on Web). */
html[data-dsh-mobile]:not([data-platform]):not([data-windows-titlebar]) [data-sidebar-drawer] {
  --dsh-frame-leading-clearance: calc(48px + env(safe-area-inset-left)) !important;
}

/* Conversation header: shipped 10px top inset, 20px leading / 28px trailing. */
html[data-dsh-mobile] [data-slot="conversation.header"] > header {
  padding-top: calc(10px + env(safe-area-inset-top));
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(28px, env(safe-area-inset-right));
}

/* Global panels (Plugins, Automation) pad 48px for the shipped frame chrome;
   add the notch / home-indicator insets on top of it. */
html[data-dsh-mobile]:not([data-platform]):not([data-windows-titlebar]) [data-sidebar-drawer] [data-global-panel] {
  box-sizing: border-box;
  padding-top: calc(48px + env(safe-area-inset-top)) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
  padding-left: env(safe-area-inset-left) !important;
  padding-right: env(safe-area-inset-right) !important;
}

/* ---- composer / reading -------------------------------------- */
html[data-dsh-mobile] [data-composer-seat] {
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

/* iOS zooms a focused field below 16px; a fine pointer never does, so the
   composer keeps its shipped type on a narrow desktop window. */
@media (pointer: coarse) {
  html[data-dsh-mobile] [data-conversation-region="composer"] [contenteditable="true"] {
    font-size: 16px !important;
    line-height: 24px !important;
  }
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

/* Header counters (subagents, background jobs) keep the shipped compact mode.
   0.2.2-rc.2 wraps the glyph in an activitySlot <span> and hides the count
   below a 460px container, so the icon and the label are no longer siblings
   here. Hiding the trigger's spans (as 0.3.0 did) hides the glyph itself. */

/* Header action labels truncate instead of widening the bar. */
html[data-dsh-mobile] [data-slot="conversation.header"] button > span {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html[data-dsh-mobile] [data-slot="conversation.header"] button[aria-label*="后台任务"] > span,
html[data-dsh-mobile] [data-slot="conversation.header"] button[aria-label*="background job"] > span {
  max-width: 72px;
}

/* ---- safe areas for shipped overlays ------------------------- */
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

/* Right panel: the full-screen strip clears the notch and the home indicator. */
html[data-dsh-mobile] [data-dockkit-strip] {
  padding-top: calc(10px + env(safe-area-inset-top)) !important;
  padding-left: calc(10px + env(safe-area-inset-left)) !important;
  padding-right: calc(6px + env(safe-area-inset-right)) !important;
}

html[data-dsh-mobile] [data-sidebar-right-session] [data-dockkit-pane] {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Settings keeps the shipped full-screen panel; only safe-area padding is ours. */
html[data-dsh-mobile] .VOzbGW_panel {
  box-sizing: border-box !important;
  padding-top: env(safe-area-inset-top) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
  padding-left: env(safe-area-inset-left) !important;
  padding-right: env(safe-area-inset-right) !important;
}

/* ---- touch typing -------------------------------------------- */
/* iOS zooms any focused text field below 16px. Force the minimum once, for
   every field on a touch pointer; the shipped 16px overrides stay valid and a
   fine pointer keeps its shipped 13px type. */
@media (pointer: coarse) {
  html[data-dsh-mobile] input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="hidden"]):not([type="file"]):not([type="color"]):not([type="button"]):not([type="submit"]):not([type="reset"]),
  html[data-dsh-mobile] textarea {
    font-size: 16px !important;
  }
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
/* DSH turns the event details into a 92%-wide overlay below 760px; layout
   stays official, only the notch/home-indicator padding is ours. */
html[data-dsh-mobile] .Y0dWHa_details {
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
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
  html[data-dsh-mobile] [data-sidebar-drawer] > div:has(> [data-slot="sidebar"]) {
    /* The shipped drawer still animates; this only keeps our padding from
       participating in any transition. */
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

    return {
      inject: [],

      apply(ctx) {
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

        // ---- compact running-jobs pill ------------------------------------
        // The shipped pill label is a sentence ("2 个后台任务运行中") and, on a
        // phone above the shipped 460px container breakpoint, it is the widest
        // thing in the header row: it squeezes the Session title down to a
        // single character. Keep the sentence in `aria-label` and rewrite only
        // the count span's text to its number while the mobile shell is on.
        // 0.2.2-rc.2 moved the glyph into a leading `activitySlot` span and
        // tagged the label `data-job-count`; older builds kept the label in the
        // button's only direct span, which is the fallback. React owns the text
        // node, so it is edited in place and every header mutation re-normalizes
        // it; turning the mobile shell off restores the sentence.
        ctx.effect(() => {
          const root = document.documentElement;
          const TRIGGER =
            '[data-slot="conversation.header"] button[aria-label*="后台任务"], ' +
            '[data-slot="conversation.header"] button[aria-label*="background job"]';

          const normalize = (button, mobile) => {
            const count =
              button.querySelector(':scope > [data-job-count]') ??
              button.querySelector(':scope > span');
            const label = button.getAttribute('aria-label') || '';
            if (count === null || label === '') return;
            const text = count.firstChild;
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
        // native drag). A stationary long press on a shipped draggable handle
        // replays the drag protocol as synthetic DragEvents, so the shipped
        // reorder handlers (model list, Session/Workspace list) run unchanged.
        //
        // The press must never fight the list's own scrolling. A finger that
        // travels before the hold elapses is a pan; a press that ends early is
        // a tap. Both cancel the timer, so the drag only exists after a
        // motionless hold. Without that, a scroll that starts on a row (most of
        // them do) is read as a reorder, and a tap leaves its timer armed: the
        // timer fires a phantom drag 450 ms later and the next tap's click is
        // swallowed by the drag's click guard.
        ctx.effect(() => {
          const root = document.documentElement;
          const dragSupported = typeof DragEvent !== 'undefined' && typeof DataTransfer !== 'undefined';
          const HOLD_MS = 450;
          // Travel that proves the gesture is a pan, not a hold. Small enough
          // to beat the scroll, large enough to ignore finger jitter.
          const SLOP = 8;
          let hold = null;
          let source = null;
          let transfer = null;
          let active = false;
          let startX = 0;
          let startY = 0;
          let moved = false;
          let suppressClickUntil = 0;

          const clearHold = () => {
            if (hold !== null) {
              window.clearTimeout(hold);
              hold = null;
            }
          };

          const cleanup = () => {
            clearHold();
            window.removeEventListener('pointermove', onMove, true);
            window.removeEventListener('pointerup', onUp, true);
            window.removeEventListener('pointercancel', onCancel, true);
            window.removeEventListener('touchmove', onTouchMoveProbe, true);
            window.removeEventListener('touchmove', onTouchMoveActive, true);
            window.removeEventListener('scroll', onScroll, true);
            source = null;
            transfer = null;
            active = false;
            moved = false;
          };

          const makeDrag = (type, point, node) => {
            if (node === null || transfer === null) return;
            try {
              node.dispatchEvent(new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                dataTransfer: transfer,
                clientX: point.clientX,
                clientY: point.clientY,
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

          const travelled = (x, y) => Math.hypot(x - startX, y - startY) > SLOP;

          // Passive probe: touchmove keeps firing while the list scrolls, so
          // this is the earliest reliable "the finger is panning" signal.
          const onTouchMoveProbe = (event) => {
            const touch = event.touches[0];
            if (touch !== undefined && travelled(touch.clientX, touch.clientY)) cleanup();
          };

          const onTouchMoveActive = (event) => {
            if (active) event.preventDefault();
          };

          // The list scrolled under the press (momentum, another finger, a
          // programmatic scroll): this gesture belongs to the list.
          const onScroll = () => {
            if (hold !== null) cleanup();
          };

          const onMove = (event) => {
            if (!active) {
              if (hold === null) return;
              if (travelled(event.clientX, event.clientY)) cleanup();
              return;
            }
            if (travelled(event.clientX, event.clientY)) moved = true;
            event.preventDefault();
            const next = rowAt(event.clientX, event.clientY);
            if (next === null) return;
            makeDrag('dragenter', event, next);
            makeDrag('dragover', event, next);
          };

          const onUp = (event) => {
            if (!active) {
              // The press ended before the hold: a tap (or a pan already
              // cancelled by a move). Drop the timer so it can never fire a
              // drag after the finger is gone.
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
            // Only a press that actually became a drag suppresses its click.
            // The next pointerdown clears the window, so a fresh tap can never
            // be swallowed by the previous drag.
            if (moved) suppressClickUntil = Date.now() + 500;
            cleanup();
          };

          const onCancel = () => {
            if (active && moved) suppressClickUntil = Date.now() + 500;
            if (active && source !== null && transfer !== null) {
              source.dispatchEvent(new DragEvent('dragend', {
                bubbles: true,
                cancelable: true,
                dataTransfer: transfer,
              }));
            }
            cleanup();
          };

          const activate = () => {
            hold = null;
            if (source === null || !source.isConnected) {
              cleanup();
              return;
            }
            try {
              transfer = new DataTransfer();
            } catch {
              cleanup();
              return;
            }
            active = true;
            const point = { clientX: startX, clientY: startY };
            window.removeEventListener('touchmove', onTouchMoveProbe, true);
            window.addEventListener('touchmove', onTouchMoveActive, { passive: false, capture: true });
            makeDrag('dragstart', point, source);
          };

          const onPointerDown = (event) => {
            // A new press owns its own click, whatever the previous gesture left.
            suppressClickUntil = 0;
            if (!dragSupported) return;
            if (event.pointerType === 'mouse') return;
            if (!root.hasAttribute('data-dsh-mobile')) return;
            const element = event.target;
            if (!(element instanceof Element)) return;
            if (element.closest('input, textarea, [contenteditable="true"]')) return;
            if (element.closest('[data-conversation-region="composer"]')) return;
            const handle = element.closest('[draggable="true"]');
            if (handle === null) return;
            if (active || hold !== null) cleanup();
            startX = event.clientX;
            startY = event.clientY;
            moved = false;
            source = handle;
            // Listen from the first frame: an early move must be able to cancel
            // the hold before the timer fires.
            window.addEventListener('pointermove', onMove, true);
            window.addEventListener('pointerup', onUp, true);
            window.addEventListener('pointercancel', onCancel, true);
            window.addEventListener('touchmove', onTouchMoveProbe, { passive: true, capture: true });
            window.addEventListener('scroll', onScroll, true);
            hold = window.setTimeout(activate, HOLD_MS);
          };

          document.addEventListener('pointerdown', onPointerDown, true);
          document.addEventListener('click', onClickCapture, true);
          return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('click', onClickCapture, true);
            cleanup();
          };
        }, 'dsh-mobile-ui: touch reorder');
      },
    };
  },
});
