setArchives();

$("#category").on("change", function(){
     let selectedValue = $(this).val();
     console.log(1);
     setArchives(selectedValue);
});

function setArchives(selectedValue="all") {
     toastr.info("Моля изчакайте!");

     $(".preloader-container").removeClass("d-none");  
    // Извикване с callback
    getLastUserId(function(id) {
        for (let i = 1; i <= id; i++) {
            let url = `https://archive-4vi4.onrender.com/users/${i}/archives.json?nocache=${new Date().getTime()}`;
    
            $.ajax({
                url: url,
                type: "GET",
                success: function (response) {
                    $("#card-container").empty();
                    response.forEach(e => {
                          if (selectedValue === "all" || selectedValue !== e.category) {
                            return; // Пропуска елементи, които не отговарят на категорията
                        }
                        let category = "ученически живот";
                        if (e.category == "sport") category = "спорт";
                        else if (e.category == "culture") category = "култура";

                        $(".card-container").html(
                            $(".card-container").html() + 
                            ` <div class="card" id="${e.id}" authorid = "${i}">
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
