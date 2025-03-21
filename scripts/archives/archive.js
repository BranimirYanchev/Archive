let allArchives = [];

$("#category").val("all");
$("#sort").val("");

if(new URLSearchParams(window.location.search).get("category")){
    setArchives(new URLSearchParams(window.location.search).get("category"));
    $("#category").val(new URLSearchParams(window.location.search).get("category"));
}else{
    setArchives();
}

$("#category").on("change", function () {
    let selectedValue = $(this).val();
    setArchives(selectedValue);
});

function setArchives(selectedValue = "all") {
    $(".preloader-container").removeClass("d-none");
    $(".card-container").empty();

    getLastUserId(function (id) {
        allArchives = []; // Изчистваме масива преди ново зареждане

        for (let i = 1; i <= id; i++) {
            let url = `https://archive-4vi4.onrender.com/users/${i}/archives.json?nocache=${new Date().getTime()}`;
        
            $.ajax({
                url: url,
                type: "GET",
                success: function (response) {
                    response.forEach(e => {
                        if (!(selectedValue === e.category || selectedValue === "all")) return;
        
                        // 🔹 Добавяме authorId, за да знаем кой е авторът
                        e.authorId = i;
        
                        allArchives.push(e);
                    });
        
                    renderArchives(allArchives);
                }
            });
        }
    });
}

function renderArchives(archives) {
    $(".card-container").empty();

    archives.forEach(e => {
        let category = "ученически живот";
        if (e.category == "sport") category = "спорт";
        else if (e.category == "culture") category = "култура";

        if(e.status != null && e.status == "hidden"){
            return false;
        }

        $(".card-container").append(`
                <div class="card" id="${e.id}" authorid="${e.authorId}">
                    <div class="card-header">
                        <img src="https://archive-4vi4.onrender.com/${e.imageUrl}" alt="archive-img" />
                    </div>
                    <div class="card-body">
                        <span class="tag tag-purple">${category}</span>
                        <h4>${e.title}</h4>
                        <p>${$(e.description).text().substring(0, 500)}...</p>
                        <div class="user">
                            <div class="user-info">
                                <h5>${e.author}</h5>
                                <small>${e.timestamp}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `);
    });

    $(".card").on("click", function () {
        window.open(`archive_single.html?id=${this.id}&authorId=${$(this).attr("authorid")}`, "_self");
    });

    $(".user-info").on("click", function (e) {
        e.stopPropagation();
        window.open(`../profile.html?userId=${$(this).closest(".card").attr("authorid")}`, "_self");
    });

    $(".preloader-container").addClass("d-none");
}

function getLastUserId(callback) {
    $.ajax({
        url: "https://archive-4vi4.onrender.com/api/get_last_user_id",
        type: "GET",
        success: function (response) {
            let id = response.id - 1;
            callback(id);
        }
    });
}

// 🔍 ТЪРСЕНЕ ПРИ НАТИСКАНЕ НА ENTER
$("#searchInput").on("keypress", function (e) {
    if (e.which === 13) { // Проверка дали натиснатият клавиш е Enter
        e.preventDefault();
        let query = $(this).val().toLowerCase();

        let titleMatches = allArchives.filter(item => item.title.toLowerCase().includes(query));

        if (titleMatches.length > 0) {
            renderArchives(titleMatches);
        } else {
            let otherMatches = allArchives.filter(item =>
                item.author.toLowerCase().includes(query) ||
                item.keywords.some(keyword => keyword.toLowerCase().includes(query))
            );
            renderArchives(otherMatches);
        }
    }
});

// 📌 СОРТИРАНЕ
$("#sort").change(function () {
    $(".preloader-container").removeClass("d-none");
    let sortBy = $(this).val();

    if(sortBy == ""){
        setArchives();
    }

    let cards = $(".card").toArray();

    cards.sort(function (a, b) {
        if (sortBy === "date") {
            let dateTextA = $(a).find("small").text().trim();
            let dateTextB = $(b).find("small").text().trim();
    
            let datePartsA = dateTextA.split("/"); // Разделяме по "/"
            let datePartsB = dateTextB.split("/");
    
            // Преобразуваме във формат "гггг-мм-дд", който new Date() разпознава
            let dateA = new Date(`${datePartsA[2]}-${datePartsA[1]}-${datePartsA[0]}`);
            let dateB = new Date(`${datePartsB[2]}-${datePartsB[1]}-${datePartsB[0]}`);
    
            return dateB - dateA; // Обратен ред (по-новите първи)
        } else if (sortBy === "name") {
            let nameA = $(a).find("h4").text().trim().toLowerCase();
            let nameB = $(b).find("h4").text().trim().toLowerCase();
            return nameA.localeCompare(nameB);
        }
    });    

    $(".card-container").empty().append(cards);
    $(".preloader-container").addClass("d-none");
});
