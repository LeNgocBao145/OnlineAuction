import query from "../libs/db.js";
import { getTop5EndingSoon, getTop5MostBids, getTop5HighestPrice, getListCategories } from "../libs/sqlQuery.js";

class HomeController {
  async getHomeData(req, res) {
    try {
      const [endingSoon, mostBids, highestPrice] = await Promise.all([
        query(getTop5EndingSoon),
        query(getTop5MostBids),
        query(getTop5HighestPrice)
      ]);

      return res.status(200).json({
        message: "Home data retrieved successfully",
        data: {
          endingSoon: endingSoon.rows,
          mostBids: mostBids.rows,
          highestPrice: highestPrice.rows
        }
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await query(`
        SELECT id, name, parent
        FROM categories
        ORDER BY parent NULLS FIRST, name
      `);
      return res.status(200).json({
        message: "Categories retrieved successfully",
        data: categories.rows
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

const homeController = new HomeController();
export default homeController;
