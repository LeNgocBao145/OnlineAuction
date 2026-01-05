import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "src", "assets", "products");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `product-${uniqueSuffix}${ext}`);
    },
});

export const uploadProductImages = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        // On frontend for existing images we send dummy files with 0 size
        // Sometimes they don't have a mimetype. If ext is valid, we allow it.
        if (extname && (mimetype || file.mimetype === "")) {
            return cb(null, true);
        }

        console.error(`[uploadProductImages] Rejected file: ${file.originalname}, mimetype: ${file.mimetype}`);
        cb(new Error(`Only images are allowed (jpeg, jpg, png, webp). Received: ${file.originalname} (${file.mimetype})`));
    },
});
