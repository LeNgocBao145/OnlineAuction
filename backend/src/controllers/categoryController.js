import query from "../libs/db.js";
import {
    getListCategories
} from "../libs/sqlQuery.js";

class CategoryController {
    async listCategories(req, res) {
        try {
            const result = await query(getListCategories);
            return res.status(200).json({ data: result.rows });
        } catch (error) {
            console.error("[listCategories] Error: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

export default new CategoryController();