setArchives();

$(".burger-btn").on("click", () => toggleMenu());

function setArchives() {
    const archiveId = new URLSearchParams(window.location.search).get("id");
    let authorId = new URLSearchParams(window.location.search).get("authorId");

    if(authorId == null){
        authorId = sessionStorage.getItem("user_Id")
    }

    let url = `https://archive-4vi4.onrender.com/users/${authorId}/archives.json`;

    $.ajax({
        url: url,
        type: "GET",
        success: function (response) {
            response.forEach(e => {
                if(e.id ==  archiveId){
                    $(".section-content").append( 
                        ` <div class="heading text-center mt-5" id=${e.id}>
                            <h1>${e.title}</h1>
                            <h2>${e.timestamp} | ${e.author}</h2>
                            <hr style="width: 70%; margin-left: 15%">
                        </div>
    
                        <div class="image-container d-flex justify-content-center mt-4">
                            <img src="${e.imageUrl}"alt="archive-img" />
                        </div>
    
                        <div class="content-conatiner d-flex flex-column align-items-center mt-4">
                            <p>${e.description}</p>
                        </div>`
                    );
                }
            });
        }  
    });
}
