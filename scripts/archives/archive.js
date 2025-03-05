setArchives();

$("#category").on("change", function(){
     let selectedValue = $(this).val();
     console.log(selectedValue);
     setArchives(selectedValue);
});

function setArchives(selectedValue="all") {
     toastr.info("Моля изчакайте!");

     $(".card-container").empty();

     $(".preloader-container").removeClass("d-none");  
    // Извикване с callback
    getLastUserId(function(id) {
        for (let i = 1; i <= id; i++) {
            let url = `https://archive-4vi4.onrender.com/users/${i}/archives.json?nocache=${new Date().getTime()}`;
    
            $.ajax({
                url: url,
                type: "GET",
                success: function (response) {
                    response.forEach(e => {
                          if (!(selectedValue === e.category || selectedValue === "all")) {
                               console.log(1);
                            return;
                        }
                        let category = "ученически живот";
                        if (e.category == "sport") category = "спорт";
                        else if (e.category == "culture") category = "култура";

                         console.log($(".card-container").html())

                        $(".card-container").html( 
                         $(".card-container").html() +  
                         `<div class="card" id="${e.id}" authorid = "${i}">
                            <div class="card-header">
                                <img src="https://archive-4vi4.onrender.com/${e.imageUrl}"alt="archive-img" />
                            </div>
                            <div class="card-body">
                                <span class="tag tag-purple">${category}</span>
                                <h4>
                                    ${e.title}
                                </h4>
                                <p>
                                    ${$(e.description).text().substring(0, 500)}...
                                </p>
                                <div class="user">
                                    <div class="user-info">
                                        <h5>${e.author}</h5>
                                        <small>${e.timestamp}</small>
                                    </div>
                                </div>
                            </div>
                        </div>`
                        );
                        $(".card").on("click", function (){  
                            window.open(`archive_single.html?id=${this.id}&authorId=${$(this).attr("authorid")}`, "_self");
                        });

                        $(".preloader-container").addClass("d-none");  
                    });
                }  
            });
        }
    });
}

function getLastUserId(callback){
    $.ajax({
        url: "https://archive-4vi4.onrender.com/api/get_last_user_id",
        type: "GET",
        success: function (response) {  
            let id = response.id - 1;
            callback(id);
        }
    });
}

$("#sort").change(function () {
     let sortBy = $(this).val();
        
     let cards = $(".card").toArray();

     cards.sort(function (a, b) {
          if (sortBy === "date") {
               // Сортиране по дата (новите първи)
               let dateA = new Date($(a).find("small").text().trim());
               let dateB = new Date($(b).find("small").text().trim());
               return dateB - dateA; // Обратен ред (по-новите първи)
          } else if (sortBy === "name") {
               // Сортиране по име (по азбучен ред)
               let nameA = $(a).find("h4").text().trim().toLowerCase();
               let nameB = $(b).find("h4").text().trim().toLowerCase();
               return nameA.localeCompare(nameB);
            }
        });

          $(cards).on("click", function (){  
               console.log(cards);
               window.open(`archive_single.html?id=${this.id}&authorId=${$(this).attr("authorid")}`, "_self");
          });

        // Подреждане на картите в DOM
        $(".card-container").empty();
        $(".card-container").append(cards);
    });
