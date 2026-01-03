import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "src", "assets", "transactions");
// Tạo folder nếu chưa có
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const productId = req.params.productId;
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${productId}_bidder${ext}`);
  },
});

export const uploadTransactionImage = multer({ storage });
