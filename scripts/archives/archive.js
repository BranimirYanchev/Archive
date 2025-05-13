// 📃️ Главен масив
let allArchives = [];
const archivesPerPage = 7;
let currentPage = 1;
const archiveCache = new Map(); // 🧠 Кеш за вече заредени архиви по userId

// 🌍 Глобални филтри
let selectedCategory = "all";
let currentSearchQuery = "";
let currentSort = "";
let currentSortDirection = "desc";

// 👈 Настройки по подразбиране
$("#category").val("all");
$("#sort").val("");

// 📅 Зареждане при вход
(async () => {
    const urlCategory = new URLSearchParams(window.location.search).get("category");
    if (urlCategory) {
        $("#category").val(urlCategory);
        selectedCategory = urlCategory;
        await setArchives();
    } else {
        await setArchives();
    }
})();

// 🔁 Смяна на категория
$("#category").on("change", function () {
    selectedCategory = $(this).val();
    renderArchivesPage(1);
});

// ⛏️ Сортиране
$("#sort").on("change", function () {
    const selected = $(this).val();
    if (currentSort === selected) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
    } else {
        currentSort = selected;
        currentSortDirection = "asc";
    }
    renderArchivesPage(1);
});

// 🔍 Търсене
$("#searchInput").on("keypress", function (e) {
    if (e.which === 13) {
        e.preventDefault();
        currentSearchQuery = $(this).val();
        renderArchivesPage(1);
    }
});

// 🧹 Основна функция за извличане
async function setArchives() {
    showPreloader();
    currentPage = 1;
    allArchives = [];

    const lastUserId = await getLastUserId();
    const userIds = Array.from({ length: lastUserId }, (_, i) => i + 1);

    const promises = userIds.map(async userId => {
        if (archiveCache.has(userId)) return archiveCache.get(userId);
        const url = `https://archive-4vi4.onrender.com/users/${userId}/archives.json?nocache=${Date.now()}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            archiveCache.set(userId, data);
            return data;
        } catch {
            return [];
        }
    });

    const results = await Promise.all(promises);

    results.forEach((userArchives, index) => {
        const authorId = index + 1;
        userArchives.forEach(e => {
            e.authorId = authorId;
            allArchives.push(e);
        });
    });

    renderArchivesPage(currentPage);
    hidePreloader();
}

// 🧐 Приложи филтри
function applyFilters() {
    let filtered = [...allArchives];

    if (selectedCategory !== "all") {
        filtered = filtered.filter(e => e.category === selectedCategory);
    }

    if (currentSearchQuery.trim() !== "") {
        const query = currentSearchQuery.toLowerCase();
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.author.toLowerCase().includes(query) ||
            item.keywords?.some(k => k.toLowerCase().includes(query))
        );
    }

    console.log(currentSort)

    if (currentSort === "date") {
        filtered.sort((a, b) => {
            const dateA = parseDate(a.timestamp);
            const dateB = parseDate(b.timestamp);
        
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
        
            const result = dateA - dateB;
            return currentSortDirection === "asc" ? result : -result;
        });        
    } else if (currentSort === "name") {
        filtered.sort((a, b) => {
            const result = a.title.localeCompare(b.title);
            return currentSortDirection === "asc" ? result : -result;
        });
    }

    console.log(filtered.map(a => a.timestamp));

    updateLiveCount(filtered.length);
    return filtered;
}

function updateLiveCount(count) {
    $("#live-count").text(`Намерени: ${count}`);
}

// 📄 Визуализация на конкретна страница
function renderArchivesPage(page) {
    $(".card-container").empty();
    currentPage = page;

    const filteredArchives = applyFilters();
    const start = (page - 1) * archivesPerPage;
    const end = start + archivesPerPage;
    const visible = filteredArchives.slice(start, end);

    visible.forEach(e => {
        if (e.status === "hidden") return;

        let category = "ученически живот";
        if (e.category === "sport") category = "спорт";
        else if (e.category === "culture") category = "култура";

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

    renderPagination(applyFilters().length, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    updateSortArrows();
}

function renderPagination(total, currentPage) {
    const totalPages = Math.ceil(total / archivesPerPage);
    const container = $(".pagination-container");
    container.empty();

    const pageButtons = [];

    // ← Стрелка
    if (currentPage > 1) {
        pageButtons.push(`<button class="nav-arrow" data-page="${currentPage - 1}" title="Назад">←</button>`);
    }

    // Винаги показваме страница 1
    pageButtons.push(`<button class="page-btn custom-page-btn mx-1 ${currentPage === 1 ? 'active' : ''}" data-page="1">1</button>`);

    // Диапазон от средни страници (до 3 бутона)
    let middlePages = [];

    if (totalPages <= 5) {
        // Ако страниците са малко – показваме всички
        for (let i = 2; i < totalPages; i++) {
            middlePages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            middlePages = [2, 3, 4];
        } else if (currentPage >= totalPages - 2) {
            middlePages = [totalPages - 3, totalPages - 2, totalPages - 1];
        } else {
            middlePages = [currentPage - 1, currentPage, currentPage + 1];
        }
    }

    if (middlePages[0] > 2) {
        pageButtons.push(`<span class="dots">...</span>`);
    }

    for (let i of middlePages) {
        if (i > 1 && i < totalPages) {
            pageButtons.push(`<button class="page-btn custom-page-btn mx-1 ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`);
        }
    }

    if (middlePages[middlePages.length - 1] < totalPages - 1) {
        pageButtons.push(`<span class="dots">...</span>`);
    }

    // Последна страница (ако не е 1)
    if (totalPages > 1) {
        pageButtons.push(`<button class="page-btn custom-page-btn mx-1 ${currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`);
    }

    // → Стрелка
    if (currentPage < totalPages) {
        pageButtons.push(`<button class="nav-arrow" data-page="${currentPage + 1}" title="Напред">→</button>`);
    }

    container.append(pageButtons.join(""));

    // Клик събития
    container.off("click").on("click", ".page-btn, .nav-arrow", function () {
        const targetPage = Number($(this).data("page"));
        if (!isNaN(targetPage)) {
            renderArchivesPage(targetPage);
        }
    });
}



// 📡 Последен user ID
async function getLastUserId() {
    const res = await fetch("https://archive-4vi4.onrender.com/api/get_last_user_id");
    const data = await res.json();
    return data.id - 1;
}


// 📅 Преобразуване на дата за сортиране
function parseDate(dateString) {
    if (!dateString || typeof dateString !== "string") return null;

    // Очакваме "DD/MM/YYYY"
    const parts = dateString.split("/");
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`); // ISO формат!
    }

    const parsed = Date.parse(dateString);
    return isNaN(parsed) ? null : new Date(parsed);
}


// 🔁 Добавяне на стрелки за сортиране
function updateSortArrows() {
    const arrow = currentSortDirection === "asc" ? "▲" : "▼";
    const sortValue = $("#sort").val();
    const sortText = {
        "date": "Дата",
        "name": "Име"
    };

    if (sortValue && sortText[sortValue]) {
        $("#sort-arrow").text(arrow);
    } else {
        $("#sort-arrow").text("");
    }

    // Обнови самите <option> текстове също (за fallback)
    $("#sort option").each(function () {
        const val = $(this).val();
        if (val && sortText[val]) {
            const suffix = (val === sortValue) ? ` ${arrow}` : "";
            $(this).text(`${sortText[val]}${suffix}`);
        }
    });
}