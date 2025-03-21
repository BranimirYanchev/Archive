if (sessionStorage.getItem("email") == null) {
    window.open("forms.html", "_self");
}

$(document).ready(function () {
    sessionStorage.setItem("role", "administrator");

    $.ajax({
        url: 'https://archive-4vi4.onrender.com/api/administrator/get_users_data', // Заменете с вашия бекенд URL
        method: 'GET',
        dataType: 'json',
        success: function (users) {
            var tbody = $('table tbody');
            tbody.empty(); // Изчистваме съществуващите записи

            users.value.forEach(function (user, index) {
                var userId = user.id; // ID на потребителя
                if (user.role != "administrator") {
                    var row = `
                    <tr data-user-id="${userId}">
                        <td>${user.id}</td>
                        <td class="user-name">Зареждане...</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>
                            <button class="btn btn-view">Преглед</button>
                            <button class="btn btn-delete">Изтрий</button>
                        </td>
                    </tr>
                `;
                    tbody.append(row);
                }

                // Взимаме firstname и lastname и ги вмъкваме в таблицата
                $.ajax({
                    url: `https://archive-4vi4.onrender.com/users/${userId}/profile_info.json?nocache=${new Date().getTime()}`,
                    method: 'GET',
                    dataType: 'json',
                    success: function (profile) {
                        console.log(profile);
                        var fullName = `${profile.personalInfo.FirstName} ${profile.personalInfo.LastName}`;
                        $(`tr[data-user-id="${userId}"] .user-name`).text(fullName);
                    },
                    error: function () {
                        $(`tr[data-user-id="${userId}"] .user-name`).text('Неизвестен');
                    }
                });

                $(document).on("click", ".btn-view", function () {
                    var userId = $(this).closest("tr").data("user-id"); // Взимаме userId от реда
                    sessionStorage.setItem("user_Id", userId);
                    window.open(`profile.html?userId=${userId}`, "_self");
                });
            });

            $(".btn-delete").on("click", function () {
                $.ajax({
                    url: `https://archive-4vi4.onrender.com/api/administrator/delete-profile?userId=${$(this).closest("tr").attr("data-user-id")}`,
                    type: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        if (response.isProfileDeleted) {
                            location.reload();
                        }
                    },
                    error: function (xhr, status, error) {
                        alert("Грешка при изтриването!");
                    }
                });
            });
        },
        error: function (error) {
            console.error('Грешка при зареждане на потребителите:', error);
        }
    });
});
