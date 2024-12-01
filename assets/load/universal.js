document.addEventListener("DOMContentLoaded", () => {
    fetch('load/header.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('header').innerHTML = data;
        });
});