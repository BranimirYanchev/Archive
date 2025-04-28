// 📌 Проверка дали потребителят е логнат чрез email в sessionStorage
if (sessionStorage.getItem("email") == null) {
    // 🚪 Пренасочване към формата за вход, ако няма логнат email
    window.open("forms.html", "_self");
}

checkToken();
hidePreloader();

$(document).ready(function () {
    // 👑 Задаваме роля "administrator" в sessionStorage
    sessionStorage.setItem("role", "administrator");

    /**
     * 📥 Извлича всички потребители от сървъра и ги визуализира в таблица.
     * 🧍 Пропуска администраторите, показва само обикновените потребители.
     * 🔍 За всеки зарежда първо и фамилно име от отделен JSON файл.
     */
    $.ajax({
        url: 'https://archive-4vi4.onrender.com/api/administrator/get_users_data',
        method: 'GET',
        dataType: 'json',
        success: function (users) {
            const tbody = $('table tbody');
            tbody.empty(); // 🧹 Изчистваме текущото съдържание

            users.value.forEach(function (user) {
                const userId = user.id;

                // 👤 Пропускаме администраторите
                if (user.role !== "administrator") {
                    const row = `
                        <tr data-user-id="${userId}">
                            <td>${user.id}</td>
                            <td class="user-name">⏳ Зареждане...</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="btn btn-view">👁️‍🗨️ Преглед</button>
                                <button class="btn btn-delete">🗑️ Изтрий</button>
                            </td>
                        </tr>
                    `;
                    tbody.append(row);

                    /**
                     * 🧾 Зарежда информация за профила:
                     * 🧑‍🤝‍🧑 Взима име и фамилия и ги добавя в таблицата
                     */
                    $.ajax({
                        url: `https://archive-4vi4.onrender.com/users/${userId}/profile_info.json?nocache=${new Date().getTime()}`,
                        method: 'GET',
                        dataType: 'json',
                        success: function (profile) {
                            const fullName = `${profile.personalInfo.FirstName} ${profile.personalInfo.LastName}`;
                            $(`tr[data-user-id="${userId}"] .user-name`).text(fullName);
                        },
                        error: function () {
                            $(`tr[data-user-id="${userId}"] .user-name`).text('❓ Неизвестен');
                        }
                    });
                }
            });
        },
        error: function (error) {
            console.error('❌ Грешка при зареждане на потребителите:', error);
        }
    });

    /**
     * 👁️‍🗨️ Обработва бутона "Преглед"
     * 📦 Запазва userId и пренасочва към профилната страница
     */
    $(document).on("click", ".btn-view", function () {
        const userId = $(this).closest("tr").data("user-id");
        sessionStorage.setItem("user_Id", userId);
        window.open(`profile.html?userId=${userId}`, "_self");
    });

    /**
     * 🗑️ Обработва бутона "Изтрий"
     * 🧨 Изпраща POST заявка за изтриване на профил
     * 🔁 Ако е успешно – презарежда страницата
     */
    $(document).on("click", ".btn-delete", function () {
        const userId = $(this).closest("tr").data("user-id");

        $.ajax({
            url: `https://archive-4vi4.onrender.com/api/administrator/delete-profile?userId=${userId}`,
            type: "POST",
            contentType: "application/json",
            success: function (response) {
                if (response.isProfileDeleted) {
                    location.reload(); // 🔁 Обновяване след изтриване
                }
            },
            error: function () {
                alert("⚠️ Грешка при изтриването!");
            }
        });
    });
});
