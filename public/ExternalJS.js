/* cookie operation */
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie() {   
    document.cookie ='Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Turn to the Unicode codeacharcodeat() method to return the Unicode encoding of the character at the specified location. The return value is an integer between 0 and 65535.
function toUnicode(str) {
    var res = [];
    for ( var i=0; i<str.length; i++ ) {
        res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
    }
    return "\\u" + res.join("\\u");
}

// The unicode escape() function encodes strings
function toStr(str){
    str = str.replace(/(\\u)(\w{1,4})/gi,function(v){
        return (String.fromCharCode(parseInt((escape(v).replace(/(%5Cu)(\w{1,4})/g,"$2")),16)));
    });
    str = str.replace(/(&#x)(\w{1,4});/gi,function(v){
        return String.fromCharCode(parseInt(escape(v).replace(/(%26%23x)(\w{1,4})(%3B)/g,"$2"),16));
    });
    str = str.replace(/(&#)(\d{1,6});/gi,function(v){
        return String.fromCharCode(parseInt(escape(v).replace(/(%26%23)(\d{1,6})(%3B)/g,"$2")));
    });

    return str;
}

async function compress(base64Str,quality){
    
    let resized_base64 = await new Promise((resolve) => {
        let img = new Image()
        img.src = base64Str
        img.onload = () => {
            let canvas = document.createElement('canvas')
        
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            var scaledheight,scaledwidth;
            //console.log(" size: "+width + "  " + height);
            if(width >= height){ /*横版图片*/
                scaledheight = 250 / width  * height;
                scaledwidth = 250;
                //console.log(" case1: "+scaledwidth + "  " + scaledheight)
            }else if(width < height){ /*竖版图片*/
                scaledheight = 225 / width * height;
                scaledwidth = 225;
                //console.log(" case2: "+scaledwidth + "  " + scaledheight);
            }
            canvas.width = scaledwidth
            canvas.height = scaledheight
            let ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, scaledwidth, scaledheight)
            resolve(canvas.toDataURL('image/png',quality)) // this will return base64 image results after resize
        }
    });
    return resized_base64;
}

function clearallimage(){
    for(var i=1;i<=9;i++){
        document.getElementById("image"+i).src = "";
        document.getElementById("image"+i+"name").innerHTML = "";
    }
}

function pasrsecurrentpagestring(){
    const pagehistoryarray = getCookie("currentpage").split(",");
    var currentpagearray = pagehistoryarray[pagehistoryarray.length-1].split("|");
    return currentpagearray[0];
}

function overwritecurrentpagestring(currentpage){
    const pagehistoryarray = getCookie("currentpage").split(",");
    pagehistoryarray[pagehistoryarray.length-1] = currentpage + "|" + getCookie("display");
    var currentpagestring = "";
    for(var i=0;i<pagehistoryarray.length-1;i++){
        currentpagestring = currentpagestring + pagehistoryarray[i] + ",";
    }
    currentpagestring = currentpagestring + pagehistoryarray[pagehistoryarray.length-1];
    document.cookie="currentpage="+currentpagestring;
    return currentpagestring;
}

function backtopreviouscurrentpage(currentpage){
    const pagehistoryarray = getCookie("currentpage").split(",");
    pagehistoryarray[pagehistoryarray.length-1] = currentpage;

    var currentpagestring = "";
    for(var i=0;i<pagehistoryarray.length-2;i++){
        currentpagestring = currentpagestring + pagehistoryarray[i] + ",";
    }
    currentpagestring = currentpagestring + pagehistoryarray[pagehistoryarray.length-2];
    
    return currentpagestring;
}

function backtohomepage(){
    document.cookie = "currentpage=1;"+getCookie("display");
    document.cookie = "currentpath="+toUnicode("当前路径：首页");
    data = {username: getCookie("username")}
    fetch("http://fwyl.ignorelist.com/requirebasedirectory",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(data=>{
        document.cookie = "currentdirectory="+toUnicode(data.basedir);
        window.location.href = "index.html";
    })
}
