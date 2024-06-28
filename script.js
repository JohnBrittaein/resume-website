
function toggleDropdown(dropdownID) {
    var content = document.getElementById(dropdownID);
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}
