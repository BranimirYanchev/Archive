setArchives()

function setArchives() {
    const archiveId = new URLSearchParams(window.location.search).get("id");
    let authorId = new URLSearchParams(window.location.search).get("authorId");

    if(authorId == null){
        authorId = sessionStorage.getItem("user_Id")
    }

    let url = `../../backend/users/${authorId}/archives.json`;

    $.ajax({
        url: url,
        type: "GET",
        success: function (response) {
            response.forEach(e => {
                if(e.id ==  archiveId){
                    $(".section-content").html(
                        $(".section-content").html() + 
                        ` <div class="heading text-center mt-5" id=${e.id}>
                            <h1>${e.title}</h1>
                            <h2>${e.timestamp} | ${e.author}</h2>
                            <hr style="width: 70%; margin-left: 15%">
                        </div>
    
                        <div class="image-container d-flex justify-content-center mt-4">
                            <img src="../../images/sport.png" alt="">
                        </div>
    
                        <div class="content-conatiner d-flex flex-column align-items-center mt-4">
                            <p>${e.description}</p>
    
                            <video width="640" height="360" controls class="mt-4">
                                <source src="../../images/1.mp4" type="video/mp4">
                                Вашият браузър не поддържа видео елемента.
                            </video>
                        </div>`
                    );
                }
            });
        }  
    });
}