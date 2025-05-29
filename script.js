
function toggleDropdown(dropdownID) {
    var content = document.getElementById(dropdownID);
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}

document.querySelectorAll('.project-item img').forEach((image) => {
    image.addEventListener('click', () => {
        if (image.requestFullscreen) {
            image.requestFullscreen();
        } else if (image.mozRequestFullScreen) { 
            image.mozRequestFullScreen();
        } else if (image.webkitRequestFullscreen) {
            image.webkitRequestFullscreen();
        } else if (image.msRequestFullscreen) { 
            image.msRequestFullscreen();
        }
    });
});

