(function () {
  try {
    var theme = localStorage.getItem("kullo:theme");
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.dataset.appTheme = theme;
  } catch (error) {
    /* localStorage can be unavailable in private contexts. */
  }
})();
