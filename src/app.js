const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const filesPayloadExists = require('./middleware/filesPayloadExists');
const fileExtLimiter = require('./middleware/fileExtLimiter');
const fileSizeLimiter = require('./middleware/fileSizeLimiter');

const PORT = process.env.PORT || 3500;

const app = express();

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '../', 'public'), { extensions: ['html'] }));
app.use('/public', express.static(path.join(__dirname, '../', 'public')));
app.use('/CSS', express.static(path.join(__dirname, '../', 'public/CSS')));
app.use('/images', express.static(path.join(__dirname, 'files')))

app.get("/images", async (req, res) => {
    let images = getImagesFromDir(path.join(__dirname, 'files'));
    res.render('images', { title: 'ALL IMAGES', images: images })
});

function getImagesFromDir(dirPath) {

    // All iamges holder, defalut value is empty
    let allImages = [];

    // Iterator over the directory
    let files = fs.readdirSync(dirPath);

    // Iterator over the files and push jpg and png images to allImages array.
    for (file of files) {
        let fileLocation = path.join(dirPath, file);
        var stat = fs.statSync(fileLocation);
        if (stat && stat.isDirectory()) {
            getImagesFromDir(fileLocation); // process sub directories
        } else if (stat && stat.isFile() && ['.jpg', '.png'].indexOf(path.extname(fileLocation)) != -1) {
            allImages.push(file); // push all .jpf and .png files to all images 
        }
    }

    // return all images in array formate
    return allImages;
}

app.post('/upload',
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg']),
    fileSizeLimiter,
    (req, res) => {
        const files = req.files
        console.log(files)

        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, 'files', files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: "error", message: err })
            })
        })

        return res.json({ status: 'success', message: Object.keys(files).toString() })
    }
)




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));