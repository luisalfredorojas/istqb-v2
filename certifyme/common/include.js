// include.js - Inyecta partials en elementos con data-include
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-include]').forEach((el) => {
    const src = el.getAttribute('data-include');
    fetch(src)
      .then((resp) => resp.text())
      .then((html) => {
        el.innerHTML = html;
      })
      .catch((err) => console.error('Error loading include:', src, err));
  });
});
