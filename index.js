const TAGS = ["programming", "crypto", "physics", "astronomy", "finance", "olympiads", "python"]
const URL = "https://raw.githubusercontent.com/iaa2005/iaa2005-blog/main/blogs/"

function getQueryParam(item) {
    var svalue = window.location.search.match(new RegExp('[\?\&]' + item + '=([^\&]*)(\&?)', 'i'));
    return svalue ? svalue[1] : svalue;
}

async function loadBlogs(blogs) {
    let i = 0;
    for (let blog of blogs) {
        await $.get(URL + blog + ".md", function (data) {
            let conv = new showdown.Converter({metadata: true});
            let html = conv.makeHtml(data);
            let metadata = conv.getMetadata();
            let date = new Date(metadata.date).toDateString().split(" ");
            date = date[3] + " " + date[1] + " " + date[2];
            let title = metadata.title;
            let tags = metadata.tags.split(" ").filter(Boolean)

            if (tags.indexOf(getQueryParam("tag")) !== -1) {
                let div_tags = `<div class="tags blogtags">`
                for (let tag of tags) {
                    div_tags += `<a class="tag" href="./?tag=${tag}">#${tag}</a>`
                }
                div_tags += `</div>`

                console.log(div_tags)

                // console.log(metadata)

                $("#blogs").append(`
                    <blog>
                        <metadata>${date}</metadata>
                        <a class="blogtitle" href="./?blog=${metadata.file}">${title}</a>
                        ${div_tags}
                    </blog>`)

                i++;
            }
        })
    }
    if (i === 0) {
        $(".nothing-text").css("display", "block");
    }
}

$(document).ready(async function () {
    $.ajaxSetup({ beforeSend : function(xhr) {
            xhr.setRequestHeader("Range", "bytes=0-3200000" );
    }});

    if (getQueryParam("blog") !== null) {
        try {
            $.get(URL + getQueryParam("blog") + ".md", function (data) {

                let conv = new showdown.Converter({metadata: true});
                let html = conv.makeHtml(data);
                let metadata = conv.getMetadata();
                let date =  new Date(metadata.date).toDateString().split(" ");
                date = date[3] + " " + date[1] + " " + date[2];
                let title = metadata.title;

                $("#metadata-html").append(`
                <titlebloghtml>${title}</titlebloghtml>
                <div style="display: flex; justify-content: space-between">
                <small>${date}</small>
                <small><a href="./">Смотреть все посты</a></small>
                </div>
                `)

                data = data.split("---").splice(2, data.length).join("---");

                let md = markdownit({
                        html: true,
                    })
                    .use(texmath, { engine: katex,
                        delimiters: 'dollars',
                        katexOptions: { macros: {"\\RR": "\\mathbb{R}"} } } );
                // console.log(md.render(data));
                document.getElementById("blog-html").innerHTML = md.render(data)

                $("#blogs").css("display", "none");
                $("header").css("display", "none");
            }).then(function () {
                hljs.highlightAll();
            })
        } catch (e) {

        }
    } else {
        if (getQueryParam("tag") !== null && TAGS.indexOf(getQueryParam("tag")) !== -1) {
            let tag = getQueryParam("tag");
            console.log(`#${tag}-tag`)
            $(`#${tag}-tag`).addClass("tag-chosed");

            await $.get("blogs.txt", function (data) {
                let blogs = data.split("\n").filter(Boolean);
                loadBlogs(blogs);
            });
        } else {
            $.get("blogs.txt", function (data) {
                let blogs = data.split("\n").filter(Boolean);

                if (blogs.length === 0) {
                    $(".nothing-text").css("display", "block");
                }
                for (let blog of blogs) {

                    // $.ajax({type: "GET",
                    //     url: "blogs/" + blog + ".md",
                    //     headers : { "Range" : 'bytes=0-3200' }}, function (data) {
                    $.get("blogs/" + blog + ".md", function (data) {
                        let conv = new showdown.Converter({metadata: true});
                        let html = conv.makeHtml(data);
                        let metadata = conv.getMetadata();
                        let date =  new Date(metadata.date).toDateString().split(" ");
                        date = date[3] + " " + date[1] + " " + date[2];
                        let title = metadata.title;
                        let tags = metadata.tags.split(" ").filter(Boolean)

                        let div_tags = `<div class="tags blogtags">`
                        for (let tag of tags) {
                            div_tags += `<a class="tag" href="./?tag=${tag}">#${tag}</a>`
                        }
                        div_tags += `</div>`

                        $("#blogs").append(`
                        <blog>
                            <metadata>${date}</metadata>
                            <a class="blogtitle" href="./?blog=${metadata.file}">${title}</a>
                            ${div_tags}
                        </blog>`)
                    })
                }
            })
        }

    }
})