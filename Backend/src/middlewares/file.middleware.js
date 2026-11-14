const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const isPdf = file.mimetype === "application/pdf" && /\.pdf$/i.test(file.originalname)

        if (!isPdf) {
            const error = new Error("Only PDF files are allowed.")
            error.status = 400
            return cb(error)
        }

        cb(null, true)
    }
})

module.exports = upload
