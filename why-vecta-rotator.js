(function () {
  var ROTATION_MS = 5000;

  function initializeWhyVecta(section) {
    var screen = section.querySelector(".why-vecta-device-screen");
    var inputs = Array.prototype.slice.call(
      section.querySelectorAll(".why-vecta-feature-input[data-screen-src]")
    );
    var indicators = Array.prototype.slice.call(
      section.querySelectorAll(".why-vecta-indicator")
    );

    if (!screen || !inputs.length) return;

    inputs.forEach(function (input) {
      var preloadImage;

      if (!input.dataset.screenSrc) return;

      preloadImage = new Image();
      preloadImage.src = input.dataset.screenSrc;
    });

    var currentIndex = Math.max(
      0,
      inputs.findIndex(function (input) {
        return input.checked;
      })
    );
    var intervalId = null;

    function syncIndicators(activeIndex) {
      indicators.forEach(function (indicator, index) {
        indicator.style.setProperty(
          "--why-vecta-indicator-duration",
          ROTATION_MS + "ms"
        );

        if (index === activeIndex) {
          indicator.classList.add("is-active");
          indicator.classList.remove("is-progressing");
          void indicator.offsetWidth;
          indicator.classList.add("is-progressing");
        } else {
          indicator.classList.remove("is-active", "is-progressing");
        }
      });
    }

    function showScreen(index) {
      var normalizedIndex = (index + inputs.length) % inputs.length;
      var activeInput = inputs[normalizedIndex];
      var nextSource = activeInput ? activeInput.dataset.screenSrc : "";

      currentIndex = normalizedIndex;
      syncIndicators(normalizedIndex);

      if (activeInput && !activeInput.checked) {
        activeInput.checked = true;
      }

      if (!nextSource || screen.getAttribute("src") === nextSource) {
        return;
      }

      screen.classList.add("is-switching");

      var handleLoad = function () {
        screen.classList.remove("is-switching");
      };

      screen.addEventListener("load", handleLoad, { once: true });
      screen.setAttribute("src", nextSource);
    }

    function restartRotation() {
      if (intervalId) {
        window.clearInterval(intervalId);
      }

      intervalId = window.setInterval(function () {
        showScreen(currentIndex + 1);
      }, ROTATION_MS);
    }

    inputs.forEach(function (input, index) {
      input.addEventListener("change", function () {
        if (!input.checked) return;

        showScreen(index);
        restartRotation();
      });
    });

    indicators.forEach(function (indicator, index) {
      indicator.addEventListener("click", function () {
        showScreen(index);
        restartRotation();
      });
    });

    showScreen(currentIndex);
    restartRotation();
  }

  function initialize() {
    document.querySelectorAll("#why-vecta").forEach(initializeWhyVecta);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
