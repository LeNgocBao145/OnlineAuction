import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "src", "assets", "transactions");
fs.mkdirSync(uploadDir, { recursive: true });

export function uploadTransactionImage(role) {
  if (!["bidder", "seller"].includes(role)) {
    throw new Error("Role must be 'bidder' or 'seller'");
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),

    filename: (req, file, cb) => {
      const productId = req.params.productId;
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${productId}_${role}${ext}`);
    },
  });

  return multer({ storage });
}
