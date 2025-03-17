import express from "express";
export const filesRouter = express.Router();
import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.')
            .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
            .slice(1)
            .join('.')
        cb(null, Date.now() + "." + ext)
    }
})
const upload = multer({ storage: storage });

filesRouter.post('/', upload.single("file"), (req, res) => {
    const base = "https://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/";
    console.log("filesRouter.post(/file: " + base + req.file?.path)
    res.status(200).send({ url: base + req.file?.path })
});