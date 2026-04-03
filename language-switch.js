(function () {
  const storageKeyPrefix = "vecta_lang_scroll:";
  const pageKey = storageKeyPrefix + window.location.pathname;

  function getStorage() {
    try {
      return window.sessionStorage;
    } catch (_error) {
      return null;
    }
  }

  function getMaxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function readSavedScroll(storage) {
    if (!storage) return null;

    try {
      const rawValue = storage.getItem(pageKey);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch (_error) {
      return null;
    }
  }

  function clearSavedScroll(storage) {
    if (!storage) return;

    try {
      storage.removeItem(pageKey);
    } catch (_error) {
      // Ignore storage cleanup failures so the page can keep working.
    }
  }

  function restoreScrollPosition(savedScroll) {
    if (!savedScroll) return;

    const maxScroll = getMaxScroll();
    const savedProgress =
      typeof savedScroll.progress === "number" ? savedScroll.progress : null;
    const savedY = typeof savedScroll.y === "number" ? savedScroll.y : 0;
    const targetY =
      savedProgress !== null
        ? Math.round(clamp(savedProgress, 0, 1) * maxScroll)
        : clamp(savedY, 0, maxScroll);

    window.scrollTo(0, targetY);
  }

  const storage = getStorage();
  const savedScroll = readSavedScroll(storage);

  if (savedScroll) {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const runRestore = function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          restoreScrollPosition(savedScroll);
        });
      });
    };

    const finishRestore = function () {
      setTimeout(function () {
        restoreScrollPosition(savedScroll);
        clearSavedScroll(storage);

        if ("scrollRestoration" in window.history) {
          window.history.scrollRestoration = "auto";
        }
      }, 80);
    };

    if (document.readyState === "complete") {
      runRestore();
      finishRestore();
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runRestore, { once: true });
      window.addEventListener("load", finishRestore, { once: true });
    } else {
      runRestore();
      window.addEventListener("load", finishRestore, { once: true });
    }
  }

  document.querySelectorAll(".lang-select").forEach(function (select) {
    select.addEventListener("change", function () {
      const targetUrl = new URL(select.value, window.location.href);

      if (targetUrl.pathname === window.location.pathname) {
        return;
      }

      const maxScroll = getMaxScroll();
      const nextPageKey = storageKeyPrefix + targetUrl.pathname;

      try {
        storage.setItem(
          nextPageKey,
          JSON.stringify({
            y: window.scrollY,
            progress: maxScroll > 0 ? window.scrollY / maxScroll : 0,
          })
        );
      } catch (_error) {
        // Ignore storage failures and fall back to the browser default navigation.
      }

      window.location.assign(targetUrl.href);
    });
  });
})();
