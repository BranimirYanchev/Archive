$(document).ready(function() {
    $("#keywordInput").keypress(function(event) {
        if (event.which === 13) {
            event.preventDefault();
            let keyword = $(this).val().trim();
            if (keyword) {
                addTag(keyword);
                $(this).val("");
            }
        }
    });
});

function addTag(keyword) {
    let tag = $('<div class="tag">' + keyword + ' <span onclick="$(this).parent().remove()">&times;</span></div>');
    $("#tags").append(tag);
}