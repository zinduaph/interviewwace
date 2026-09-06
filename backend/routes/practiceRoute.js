import express from "express"
import { uploadCv } from "../controller/practice.js";
import multer from 'multer';
const practiceRouter = express.Router()

const cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'cv'));
        }
        callback(null, true);
    }
});


practiceRouter.post('/upload-cv', cvUpload.single('cv'),uploadCv)
practiceRouter.get('/test', (req, res) => {
    res.json({ message: 'Practice route is working' });
});

export default practiceRouter;