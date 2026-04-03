(function () {
  const storageKey = "vecta_theme";
  const mediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

  function getStorage() {
    try {
      return window.localStorage;
    } catch (_error) {
      return null;
    }
  }

  function readStoredTheme(storage) {
    if (!storage) return null;

    try {
      const storedTheme = storage.getItem(storageKey);
      return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
    } catch (_error) {
      return null;
    }
  }

  function getPreferredTheme(storage) {
    const storedTheme = readStoredTheme(storage);

    if (storedTheme) {
      return storedTheme;
    }

    return mediaQuery && mediaQuery.matches ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }

  function syncThemeImages(theme) {
    document.querySelectorAll("[data-theme-image]").forEach(function (image) {
      const nextSource =
        theme === "dark" ? image.dataset.darkSrc : image.dataset.lightSrc;

      if (nextSource && image.getAttribute("src") !== nextSource) {
        image.setAttribute("src", nextSource);
      }
    });
  }

  function syncThemeButtons(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      const isDark = theme === "dark";
      const label = button.querySelector("[data-theme-toggle-label]");
      const nextLabel = isDark ? button.dataset.darkLabel : button.dataset.lightLabel;
      const ariaLabel = isDark ? button.dataset.ariaLight : button.dataset.ariaDark;

      button.setAttribute("aria-pressed", isDark ? "true" : "false");

      if (ariaLabel) {
        button.setAttribute("aria-label", ariaLabel);
      }

      if (label && nextLabel) {
        label.textContent = nextLabel;
      }
    });
  }

  function applyTheme(theme) {
    setTheme(theme);
    syncThemeButtons(theme);
    syncThemeImages(theme);
  }

  const storage = getStorage();
  applyTheme(getPreferredTheme(storage));

  function initializeThemeControls() {
    applyTheme(document.documentElement.dataset.theme || getPreferredTheme(storage));

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        const nextTheme =
          document.documentElement.dataset.theme === "dark" ? "light" : "dark";

        try {
          if (storage) {
            storage.setItem(storageKey, nextTheme);
          }
        } catch (_error) {
          // Ignore storage failures and continue switching themes for this page view.
        }

        applyTheme(nextTheme);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeThemeControls, {
      once: true,
    });
  } else {
    initializeThemeControls();
  }

  if (mediaQuery) {
    const handleChange = function (event) {
      if (readStoredTheme(storage)) {
        return;
      }

      applyTheme(event.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);
    }
  }
})();
