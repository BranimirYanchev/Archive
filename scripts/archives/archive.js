let now = new Date();
let hours = now.getHours().toString().padStart(2, '0');
let minutes = now.getMinutes().toString().padStart(2, '0');
let seconds = now.getSeconds().toString().padStart(2, '0');
console.log(`${hours}:${minutes}:${seconds}`);

setArchives();

function setArchives() {

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
                        let category = "ученически живот";
                        if (e.category == "sport") category = "спорт";
                        else if (e.category == "news") category = "новини";

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

                         console.log(`${hours}:${minutes}:${seconds}`);

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
