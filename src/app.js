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
    res.render('images', { title: 'Images', images: images })
});

function getImagesFromDir(dirPath) {
    let images = [];
    let files = fs.readdirSync(dirPath);

    files.forEach((e) => {
        let dirFile = path.join(dirPath, e);
        const stat = fs.statSync(dirFile);
        if (stat && stat.isFile() && ['.jpg', '.png', '.jpeg'].indexOf(path.extname(dirFile)) != -1) {
            images.push(e);
        }
    })
    return images;
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