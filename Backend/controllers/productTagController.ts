import { Request, Response } from "express";
import { ProductTag } from "../models";
import sequelize from "./../configs/mysql-database-connect";

export const getProductIDs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tagIDs } = req.body;
    if (!Array.isArray(tagIDs) || tagIDs.length === 0) {
      res.status(400).json({ error: "tagIDs must be a non-empty array" });
    }

    // Find products that have all the specified tagIDs
    const products = await ProductTag.findAll({
      where: {
        tagID: tagIDs,
      },
      attributes: ["productID"],
      group: ["productID"],
      having: sequelize.where(
        sequelize.fn("COUNT", sequelize.col("tagID")),
        tagIDs.length
      ),
    });
    const productIDs = products.map((product) => product.productID);
    res
      .status(200)
      .json({ message: "Get productIDs succeed", productIDs: productIDs });
  } catch (error) {
    console.error("Error in product-tag route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
