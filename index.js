//website address: http://192.168.1.68:80
//http://fwyl.ignorelist.com
//"test": "echo \"Error: no test specified\" && exit 1"

const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const Jimp = require("jimp");
const readline = require('readline');
const sharp = require("sharp");
const sizeOf = require('buffer-image-size');
const port = 80;                  //Save the port number where your server will be listening
const InvitecodeLV0 = "AnimeLife0717"; 
const InvitecodeLV1 = "AnimeLife2233";            //New User Invitation Code (邀请码)
const baseDirectory = "F:/Learning Objective";
const renderquality = 15;

//user level (highest): 0 basedir:"D:/Learning Objective"
//user level: 1 basedir:"D:/Learning Objective/漫画"

var jsonparser = bodyParser.json()

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./UserInfo.db"
    },
    useNullAsDefault: true
});


app.use('/', express.static('public'));
//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    //console.log("reached login!");
    res.sendFile("login.html", {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.get('/index.html', function(req, res) {
    console.log("reached mainpage!");
    res.sendFile("index.html", {root: __dirname});
});

app.get('/ImgView.html', function(req, res) {
    console.log("reached ImgView!");
    res.sendFile("ImgView.html", {root: __dirname});
});

app.get('/login.html', function(req, res) {
    res.sendFile("login.html", {root: __dirname});
});

app.get('/user.html', function(req, res) {
    res.sendFile("user.html", {root: __dirname});
});

app.get('/TxtView.html', function(req, res) {
    res.sendFile("TxtView.html", {root: __dirname});
});
/*option 1: original size image
    console.log("image request received");
    var img = "C:/Users/Patrick/Pictures/123.jpg";
    if(img!=""){
        const buffer = fs.readFileSync(img);
        fs.writeFileSync("./public/SmallImg1.jpg", buffer);
        console.log('image recieving done');
    }   
*/

var server_port = process.env.YOUR_PORT || process.env.PORT || port;

app.listen(server_port,() => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${server_port}`); 
});



/*用户信息 post & get*/
app.post("/userinfocheckrequest",jsonparser, async(req,res)=>{   
    const username = req.body.username;
    const password = req.body.password;
    //TODO: read from file userinfo
   
    try{
        if(req.body.action == "login"){
            var basedir;
            await knex('UserData').where({UserName: username}).first().then((rows) => {
                const Data=JSON.parse(`${rows['Data']}`);
                basedir =  Data.basedir;
            })
            await knex('UserData').where({UserName: username}).first().then((rows) => {
                try{
                    if (password == `${rows['Password']}`){
                        res.json({msg: "success", username: username, basedir: basedir});
                    }
                    else{
                        res.json({msg: "fail"});
                    }
                }
                catch(error){
                    res.json({msg: "fail"});
                }
            })
        }
        else if(req.body.action == "register"){
            const viewhistroyarray = ["","","","",""];
            if(req.body.invitecode == InvitecodeLV0 || req.body.invitecode == InvitecodeLV1){
                var basedirectory;
                if(req.body.invitecode == InvitecodeLV0)        { basedirectory = "D:/Learning Objective";}
                else if(req.body.invitecode == InvitecodeLV1)   { basedirectory = "D:/Learning Objective/漫画";}
    
                const nullobj = {sex:"不详",age:"不详",birthdaymonth:"不详",birthdayday:"不详", basedir:basedirectory}
                await knex.insert({UserName:req.body.username, 
                                Password:req.body.password,
                                ProfileImg:null,
                                ViewHistory:viewhistroyarray.join(" <> "), 
                                Data:nullobj}).into("UserData");
                
                res.json({msg: "success"});        
            }
            else{
                res.json({msg: "fail"});
            }
        }
    }
    catch(err){
        res.json({msg: "fail"});
    }
});

/*用户信息 post & get (old version) for "login" */

// var userdata = fs.readFileSync('./public/userdata.txt', 'utf8');
// var userdataArray = userdata.split(";");

// for(var i=0;i<userdataArray.length;i++){
//     var temp = userdataArray[i].split(",");
//     if(username == temp[0] && password == temp[1]){
//         console.log("user login: "+username);
//         res.json({
//             msg: "success",
//             username: username
//         });
//         return;
//     }
// }

// res.json({
//     msg: "fail"
// });

/*用户信息 post & get (old version) for "Register" */

// var userdata = fs.readFileSync('./public/userdata.txt', 'utf8');;
            // userdata = userdata + ";" + username + "," +  password;

            // fs.writeFileSync('./public/userdata.txt', userdata, err => {
            //     if (err) {
            //       console.error(err);
            //     }
            //     // file written successfully
            // });

app.post("/uploadprofileimage",jsonparser, async(req,res)=>{  
    await knex('UserData').update('ProfileImg', req.body.ProfileImg).where('UserName', req.body.UserName);
    res.json({ProfileImg:req.body.ProfileImg});
});

app.post("/requestprofile",jsonparser, async(req,res)=>{  
    try{
        await knex('UserData').where({UserName: req.body.UserName}).first().then((rows) => {
            const Data=JSON.parse(`${rows['Data']}`);
            res.json({ProfileImg:`${rows['ProfileImg']}`,
                        sex:Data.sex ,
                        age:Data.age,
                        birthdaymonth:Data.birthdaymonth,
                        birthdayday:Data.birthdayday});
        })
    }
    catch(err){}
});

app.post("/requesthistory",jsonparser, async(req,res)=>{ 
    var base64cachearray = ["","","","",""];
    var directoryarray = ["","","","",""];
    var ViewHistoryarray;
    await knex('UserData').where({UserName: req.body.UserName}).first().then((rows) => {
        ViewHistoryarray=`${rows['ViewHistory']}`.split(" <> ");
        
    })

    for(var i=0;i<5;i++){
        //console.log("check:"+ViewHistoryarray[i]+"check");
        if(ViewHistoryarray[i]!="" && ViewHistoryarray[i]!=" "){
            const array = ViewHistoryarray[i].split("/");
            directoryarray[i] = array[array.length-1];
            base64cachearray[i] = await FindFirstJpgInBase64InDir(ViewHistoryarray[i]);
        }
    }
    //console.log(base64cachearray);
    res.json({base64cachearray:base64cachearray, directoryarray:directoryarray})
});

app.post("/uploaduserinfo",jsonparser, async(req,res)=>{
    const saved_sex = req.body.sex;
    const saved_age = req.body.age;
    const saved_birthdaymonth = req.body.birthdaymonth;
    const saved_birthdayday = req.body.birthdayday;
    const jsonobj = {sex: saved_sex, age: saved_age, birthdaymonth: saved_birthdaymonth, birthdayday: saved_birthdayday};
    await knex('UserData').update('Data', JSON.stringify(jsonobj)).where('UserName', req.body.UserName);
});    

app.post("/parsetobase64request",jsonparser, async(req,res)=>{   
    var directoryPath = req.body.currentdirectory;
    var currentpage = req.body.currentpage;
    var imageid = req.body.imageid;
    //console.log("render "+directoryPath +" image"+imageid);
    var array=[];
    
    if(directoryPath == "D:") directoryPath = "D:/Learning Objective";
    // else if(CheckIfIsDirectory(directoryPath)==false){
    //     var directoryarray = directoryPath.split("/");
    //     directoryPath = "";
    //     for(var i=0;i<directoryarray.length-1;i++){
    //         directoryPath = directoryPath + directoryarray[i] + "/";
    //     }
    //     directoryPath = directoryPath + directoryarray[directoryarray.length-2];
    //     console.log("success: " + directoryPath);
    // }


    let openedDir = fs.opendirSync(directoryPath);
    let filesLeft = true;
    while (filesLeft) {
        let fileDirent =openedDir.readSync();
        if (fileDirent != null){
            //console.log("Name:", fileDirent.name);
            var filename=fileDirent.name;
            var extension = filename.slice(fileDirent.name.length-3,fileDirent.name.length);
            if(extension!="mp4" && extension!="zip" && extension!="ini" && extension!="rar" && extension!=".7z" && extension!="!ut" && extension!="url" && extension!="txt" && extension!=".db"){
                if(filename.includes("fwylCoverIMGbuffer") == false){ /* ignore manga folder cover buffer image */
                    array.push(filename);
                }
            }
        }
        else filesLeft = false;
    }
    openedDir.close();
    array.sort();
    //console.log(array);

    var numberofdisplay;
    if(array.length<=9*currentpage){
        numberofdisplay=array.length - 9*(currentpage-1);
    }else{
        numberofdisplay=9;
    }

    var base64cache = "";
    var i;
    if(imageid <= numberofdisplay){
        i = 9*(currentpage-1)+imageid;
    
        //find and render the first image in a folder
        var extension = array[i-1].slice(array[i-1].length-4,array[i-1].length);
        if(extension==".jpg" || extension==".png" || extension=="jpeg"){
            //console.log("check1:"+i);
            //base64cache = fs.readFileSync(directoryPath+"/"+array[i-1], "base64");
            base64cache = await compress(fs.readFileSync(directoryPath+"/"+array[i-1], "base64"));
        }
        else{
            base64cache = await FindFirstJpgInBase64InDir(directoryPath+"/"+array[i-1]); 
            //console.log("check"+(i-1)%9+": "+directoryPath+"/"+array[i-1]);
        }    
    }

    res.json({
        msg: "success",
        numoffile: array.length,
        imagestring: base64cache,
        imagename: array[i-1],
        imageid: imageid,
    });
});

app.post("/parsewithoutbase64request",jsonparser, async(req,res)=>{   
    var directoryPath = req.body.currentdirectory;
    var currentpage = req.body.currentpage;
    var imageid = req.body.imageid;
    //console.log("render "+directoryPath +" image"+imageid);
    var array=[];
    
    if(directoryPath == "D:") directoryPath = "D:/Learning Objective";

    let openedDir = fs.opendirSync(directoryPath);
    let filesLeft = true;
    while (filesLeft) {
        let fileDirent =openedDir.readSync();
        if (fileDirent != null){
            //console.log("Name:", fileDirent.name);
            var filename=fileDirent.name;
            var extension = filename.slice(fileDirent.name.length-3,fileDirent.name.length);
            if(extension!="mp4" && extension!="zip" && extension!="ini" && extension!="rar" && extension!=".7z" && extension!="!ut" && extension!="url" && extension!="txt" && extension!=".db"){
                if(filename.includes("fwylCoverIMGbuffer") == false){ /* ignore manga folder cover buffer image */
                    array.push(filename);
                }
            }
        }
        else filesLeft = false;
    }
    openedDir.close();
    array.sort();
    //console.log(array);

    var numberofdisplay;
    if(array.length<=20*currentpage){
        numberofdisplay=array.length - 20*(currentpage-1);
    }else{
        numberofdisplay=20;
    }

    var i;
    if(imageid <= numberofdisplay){
        //console.log("success: " + array[i-1]);
        i = 20*(currentpage-1)+imageid;
        res.json({
            msg: "success",
            numoffile: array.length,
            imagename: array[i-1],
            imageid: imageid
        });
    }
    else{
        res.json({
            msg: "fail",
            imageid: imageid
        });
    }

});

app.post("/requireimagepopup",jsonparser, async(req,res)=>{   
    const directory = req.body.directory;
    var base64cache;
    var extension = directory.slice(directory.length-4,directory.length);
    if(extension==".jpg" || extension==".png" || extension=="jpeg" || extension==".JPG"){
        base64cache = fs.readFileSync(directory, "base64");
    }
    else{
        base64cache = await FindFirstJpgInBase64InDir(directory);
    }
    base64cache = await compressimgview(base64cache,60)
    res.json({
        base64cache: base64cache
    })
});

app.post("/IndividualImageRequest",jsonparser, async(req,res)=>{  
    Addtohistory(req.body.username,req.body.currentdirectory)

    var currentdirectory = req.body.currentdirectory;
    var pagenumber = req.body.pagenumber;

    //case1: used for page flip
    if(pagenumber != undefined){
        var pagelist = req.body.Pagelist;
        //console.log("pagelist: "+pagelist);

        /*parse directory pass (below)*/
        const temp = currentdirectory.split("/");
        var directory = "";
        for(var i=0;i<temp.length-2;i++){
            directory = directory + temp[i] + "/";
        }
        directory = directory + temp[temp.length-2];
        /*parse directory pass (above)*/

        if(pagelist != "undefined"){ // case 1.1
            const pagelistarray = pagelist.split("/");
            directory = directory + "/" + pagelistarray[pagenumber-1];

            //console.log("case 1.1 " + pagelistarray[pagenumber-1]);

            var base64 = fs.readFileSync(directory, "base64");
            const buffer = Buffer.from(base64, "base64");
            var dimensions = sizeOf(buffer);
            if(fs.statSync(currentdirectory).size < 2*1024*1024){
                base64 = await compressimgview(base64,90);
            }else{
                base64 = await compressimgview(base64,60);
            }
            
                
            res.json({
                msg: "success 1.1",
                ImageString: base64,
                width: dimensions.width,
                height: dimensions.height
            });
        }
        else{ // case 1.2
            //create a page list for storing in cookie
            var pagelist="";
            let openedDir = fs.opendirSync(directory);
            let filesLeft = true;
            while (filesLeft) {
                let fileDirent =openedDir.readSync();

                if (fileDirent != null){
                    var filename=fileDirent.name;
                    pagelist=pagelist + filename + "/";
                }
            
                else filesLeft = false;
            }
            openedDir.close();
            	
            pagelist = pagelist.substring(0, pagelist.length - 1);

            const pagelistarray = pagelist.split("/");
            directory = directory + "/" + pagelistarray[pagenumber-1];

            //console.log("case 1.2 " + pagelistarray[pagenumber-1]);

            var base64 = fs.readFileSync(directory, "base64");
            const buffer = Buffer.from(base64, "base64");
            var dimensions = sizeOf(buffer);
            if(fs.statSync(currentdirectory).size < 2*1024*1024){
                base64 = await compressimgview(base64,90);
            }else{
                base64 = await compressimgview(base64,60);
            }

            res.json({
                msg: "success 1.2",
                ImageString: base64,
                width: dimensions.width,
                height: dimensions.height,
                pagelistarray: pagelist
            });
        }
        
        return;
    }

    //case2: generate one image when first enter image view
    var base64 = fs.readFileSync(currentdirectory, "base64");

    const buffer = Buffer.from(base64, "base64");
    var dimensions = sizeOf(buffer);
    if(fs.statSync(currentdirectory).size < 2*1024*1024){
        base64 = await compressimgview(base64,90);
    }else{
        base64 = await compressimgview(base64,60);
    }
    //console.log(dimensions.width, dimensions.height);

    res.json({
        msg: "success 2",
        ImageString: base64,
        width: dimensions.width,
        height: dimensions.height
    });
});


app.post("/getcurrentpagenumber",jsonparser, (req,res)=>{  
    var currentdirectory = req.body.currentdirectory;

    const temp = currentdirectory.split("/");
    const imagename = temp[temp.length-1];
    
    var curentpagenumber;
    var totalnumofpage = 0;

    /*parse directory pass (below)*/
    var directory = "";
    for(var i=0;i<temp.length-2;i++){
        directory = directory + temp[i] + "/";
    }
    directory = directory + temp[temp.length-2];
    //console.log(directory);
    /*parse directory pass (above)*/

    let openedDir = fs.opendirSync(directory);
    let filesLeft = true;
    while (filesLeft) {
        let fileDirent =openedDir.readSync();
        if (fileDirent != null){
            //console.log("Name:", fileDirent.name);
            var filename=fileDirent.name;

            if(filename.length >= 5){
                var extension = filename.slice(filename.length-4,filename.length);
                if(extension==".jpg" || extension==".png" || extension=="jpeg" || extension==".JPG"){
                    totalnumofpage ++;
                }
            }

            if(filename == imagename){
                curentpagenumber = totalnumofpage;
            }

        }
        else filesLeft = false;
    }

    openedDir.close();

    res.json({
        msg: "success",
        curentpagenumber: curentpagenumber,
        totalnumofpage: totalnumofpage
    });
});


app.post("/requirebasedirectory",jsonparser, async(req,res)=>{  
    var basedir;
    if(req.body.username != ""){
        await knex('UserData').where({UserName: req.body.username}).first().then((rows) => {
            const Data=JSON.parse(`${rows['Data']}`);
            basedir =  Data.basedir;
        })
    }
    console.log("check");
    res.json({
        basedir:basedir
    });
});

async function FindFirstJpgInBase64InDir(directoryPath){
    let openedDir = fs.opendirSync(directoryPath);
    let filesLeft = true;
    while (filesLeft) {
        let fileDirent =openedDir.readSync();
        if (fileDirent != null){
            //console.log("Name:", fileDirent.name);
            var filename=fileDirent.name;
            var extension = filename.slice(fileDirent.name.length-4,fileDirent.name.length);
            if(extension==".jpg" || extension==".png" || extension=="jpeg" || extension==".JPG"){
                //var base64 = fs.readFileSync(directoryPath+"/"+filename, "base64");
                var base64 = await compress(fs.readFileSync(directoryPath+"/"+filename, "base64"));

                openedDir.close();
                //console.log(base64);
                return base64.toString("base64");
            }
        }
        else filesLeft = false;
    }
    openedDir.close();
    //if no jpg in the directory
    var base64 = fs.readFileSync("./public/folderIcon.png", "base64");
    //const buffer = Buffer.from(base64, "base64");

    return base64;
}


async function compress(base64) {
    if (!base64) {
        throw console.error("not a base64 string");
      } else {
        const Buffer = require("buffer").Buffer;
        let base64buffer = Buffer.from(base64, "base64");
        var image = await sharp(base64buffer)
          .jpeg({quality: renderquality})
          .toBuffer();
    
        const newBase64 = await image.toString("base64");
    
        return newBase64;
    }
}

async function compressimgview(base64,quality) {
    if (!base64) {
        throw console.error("not a base64 string");
      } else {
        const Buffer = require("buffer").Buffer;
        let base64buffer = Buffer.from(base64, "base64");
        var image = await sharp(base64buffer)
          .jpeg({quality: quality})
          .toBuffer();
    
        const newBase64 = await image.toString("base64");
    
        return newBase64;
    }
}

function backup(destDir){
    const fse = require('fs-extra');
    fse.copySync("UserData.db", destDir, {
        overwrite: true
      }, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("success!");
        }
    });
}

async function Addtohistory(username, directory){
    var checker = 0;
    var historyarray;
    await knex('UserData').where({UserName: username}).first().then((rows) => {
        historyarray=`${rows['ViewHistory']}`.split(" <> ");
        
        /* parse the just viewed document path (below)*/
        var newhistoryarray = directory.split("/");
        var newhistory = newhistoryarray[0];
        for(var i=1;i<newhistoryarray.length-1;i++){
            newhistory = newhistory + "/"+ newhistoryarray[i];
        }
        /* parse the just viewed document path (above)*/

        if(historyarray[0] != newhistory){
            for(var i=historyarray.length-2;i>=0;i--){
                historyarray[i+1] = historyarray[i];
            }  
            historyarray[0]=newhistory;
            checker = 1;
        }
    })

    if(checker == 1){
        await knex('UserData').update('ViewHistory', historyarray.join(" <> ")).where('UserName', username);
    } 
}

function CheckIfIsDirectory(directory){
    return fs.lstatSync(directory).isDirectory();
}

/* for 站长特供小说page (below) */
app.post("/requestnovel",jsonparser, async (req,res)=>{  
    var array= new Array();

    const fileStream = fs.createReadStream('public/晴れた雨.txt');
    const readline = require('readline');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        array.push(line);
    }

    res.json({title:"晴れた雨",content:array});
})
/* for 站长特供小说page (above) */