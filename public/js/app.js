/**
 * @file public/js/app.js
 * 
 * @description Small browser-side enhancements for the EJS-rendered app.
 * 
 * Author: mghazel
 * 
 * Version: 10-June-2026
 */

/**
 * Scrolls the page to the top when the floating button is clicked.
 * This is intentionally small because CRUD is handled server-side and by REST APIs.
 */
document.addEventListener('DOMContentLoaded', () => {
    const goTopButton = document.getElementById('goTopButton');

    if (goTopButton) {
        goTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
