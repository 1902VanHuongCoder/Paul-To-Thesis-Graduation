import { Request, Response } from "express";
import {
  Category,
  Comment,
  Origin,
  Product,
  ProductTag,
  SubCategory,
  Tag,
  User,
} from "../models";
import InventoryTransaction from "../models/InventoryTransaction";
import { Op } from "sequelize";

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Only return products that have not expired or null expiredAt
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProductsHaveNotExpired = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch products that have not expired or have null expiredAt
    const products = await Product.findAll({
      where: {
        expiredAt: {
          [Op.or]: [
            { [Op.gt]: new Date() }, // Not expired
            { [Op.is]: null }, // No expiration date
          ],
        },
        isShow: true,
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching non-expired products:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProductByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productID } = req.params;

  try {
    const product = await Product.findByPk(productID, {
      include: [
        { model: Category, as: "category" }, // Include associated category
        { model: SubCategory, as: "subcategory" }, // Include associated subcategory
        { model: Tag }, // Include associated tags
        { model: Origin, as: "origin" }, // Include associated origin
        {
          model: Comment,
          as: "comments",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    barcode, // <-- add barcode
    boxBarcode, // <-- add boxBarcode
    quantityPerBox,
    productName,
    productPrice,
    productPriceSale,
    quantityAvailable,
    categoryID,
    tagIDs, // Array of tag IDs
    originID,
    subcategoryID,
    images,
    descriptionImages,
    description,
    unit,
    isShow,
    expiredAt,
    diseases,
  } = req.body;

  console.log("Request body:", req.body);

  // Generate a order for the product based on the largest product's order value 
  try {
    const maxOrder = await Product.max("order");
    const newOrder = typeof maxOrder === "number" ? maxOrder + 1 : 1;

    // Create the product
    const newProduct = await Product.create({
      barcode, // <-- add barcode
      boxBarcode, // <-- add boxBarcode
      quantityPerBox,
      productName,
      productPrice,
      productPriceSale,
      quantityAvailable,
      categoryID,
      originID,
      subcategoryID,
      images,
      descriptionImages,
      description,
      rating: 5,
      unit,
      isShow,
      diseases,
      expiredAt,
      order: newOrder, // Set the order value
    });

    // Increment the count of the selected category
    if (categoryID) {
      await Category.increment("count", {
        by: 1,
        where: { categoryID: categoryID },
      });
    }

    // Handle tags
    if (tagIDs && Array.isArray(tagIDs)) {
      const productTags = tagIDs.map((tagID: number) => ({
        productID: newProduct.productID,
        tagID,
      }));

      await ProductTag.bulkCreate(productTags);
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productID } = req.params;
  const {
    barcode, // <-- add barcode
    boxBarcode, // <-- add boxBarcode
    quantityPerBox,
    productName,
    productPrice,
    productPriceSale,
    quantityAvailable,
    categoryID,
    tagIDs,
    originID,
    subcategoryID,
    images,
    descriptionImages,
    description,
    unit,
    isShow,
    expiredAt,
    performedBy,
    diseaseIDs,
  } = req.body;

  console.log("Request body:", req.body);

  try {
    const product = await Product.findByPk(productID);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Update the product
    const oldQuantity = product.quantityAvailable;
    await product.update({
      barcode, // <-- add barcode
      boxBarcode, // <-- add boxBarcode
      quantityPerBox,
      productName,
      productPrice,
      productPriceSale,
      quantityAvailable,
      categoryID,
      originID,
      subcategoryID,
      images,
      descriptionImages,
      description,
      unit,
      isShow: isShow,
      expiredAt,
      diseases: diseaseIDs,
    });

    // If quantityAvailable changed, create an 'update' inventory transaction
    if (
      typeof quantityAvailable === "number" &&
      oldQuantity !== quantityAvailable
    ) {
      await InventoryTransaction.create({
        productID: product.productID,
        quantityChange: quantityAvailable - oldQuantity,
        transactionType: "update",
        note: `Cập nhật sản phẩm ${product.productID}`,
        performedBy: performedBy || "system",
      });
    }

    // Handle tags
    if (tagIDs && Array.isArray(tagIDs)) {
      // Delete existing tags for the product
      await ProductTag.destroy({ where: { productID: productID } });

      // Add updated tags
      const productTags = tagIDs.map((tagID: number) => ({
        productID: productID,
        tagID,
      }));

      await ProductTag.bulkCreate(productTags);
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productID } = req.params;

  try {
    const product = await Product.findByPk(productID);

    if (!product) {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Delete related records in ProductTag and ProductAttribute
    await ProductTag.destroy({ where: { productID: productID } });

    // Decrement the count of the selected category
    if (product.categoryID) {
      await Category.decrement("count", {
        by: 1,
        where: { categoryID: product.categoryID },
      });
    }

    // Delete the product
    await product.destroy();

    res.status(204).json({ message: "Sản phẩm đã được xóa thành công" });
  } catch (error: any) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message:
          "Không thể xóa sản phẩm vì thông tin của nó đang được sử dụng trong đơn hàng. Vui lòng xóa hoặc cập nhật các đơn hàng liên quan trước.",
      });
    } else {
      res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xóa sản phẩm. Hãy thử lại." });
    }
  }
};

// Get products by product name which is a query parameter
export const getProductByName = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.query;

  if (!name || typeof name !== "string") {
    res.status(400).json({ message: "Product name is required" });
    return;
  }

  try {
    const products = await Product.findAll({
      where: {
        productName: {
          [Op.like]: `%${name}%`, // Use LIKE for partial matching
        },
      },
      order: [["createdAt", "DESC"]],
    });

    if (products.length === 0) {
      res.status(404).json({ message: "No products found" });
      return;
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by name:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get product by barcode
export const getProductByBarCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { barcode } = req.params;

  console.log(barcode);

  if (!barcode) {
    res.status(400).json({ message: "Barcode is required" });
    return;
  }

  try {
    const product = await Product.findOne({ where: { barcode } });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update many products after they changed quantityAvailable
export const updateListOfProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const products = req.body; // Expecting an array of products

  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ message: "Invalid product data" });
    return;
  }

  try {
    const updatePromises = products.map(
      async (product: {
        productID: number;
        quantityAvailable: number;
        note: string;
        performedBy: string;
      }) => {
        // Find the existing product to get the old quantity
        const existing = await Product.findByPk(product.productID);
        if (!existing) return;
        const oldQty = existing.quantityAvailable;
        const newQty = product.quantityAvailable;
        const quantityChange = newQty - oldQty;
        // Update product quantity
        await Product.update(
          { quantityAvailable: newQty },
          { where: { productID: product.productID } }
        );
        // Only create transaction if quantity actually changed
        if (quantityChange !== 0) {
          await InventoryTransaction.create({
            productID: product.productID,
            quantityChange,
            transactionType: "import",
            performedBy: product.performedBy,
            note: product.note,
          });
        }
      }
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Products updated successfully" });
  } catch (error) {
    console.error("Error updating products:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get product by box barcode
export const getProductByBoxBarcode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { boxBarcode } = req.params;

  console.log("Box barcode:", boxBarcode);

  if (!boxBarcode) {
    res.status(400).json({ message: "Box barcode is required" });
    return;
  }

  try {
    const product = await Product.findOne({
      where: { boxBarcode: boxBarcode },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by box barcode:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get top 5 selling products based on the number of orders containing each product
export const getTopSellingProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Find top 5 products by number of orders (count distinct orderID for each productID)
    const topProducts = await OrderProduct.findAll({
      attributes: [
        "productID",
        [
          // Count distinct orderID for each productID
          OrderProduct.sequelize!.fn(
            "COUNT",
            OrderProduct.sequelize!.col("orderID")
          ),
          "orderCount",
        ],
      ],
      group: ["productID"],
      order: [[OrderProduct.sequelize!.literal("orderCount"), "DESC"]],
      limit: 5,
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    console.log("Top selling products:", topProducts);
    res.status(200).json(topProducts);
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get poor selling products based on the number of orders containing each product and the products that have not been ordered
export const getPoorSellingProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Find up to 10 products that have never been ordered
    const neverOrderedProducts = await Product.findAll({
      where: {
        productID: {
          [Op.notIn]: OrderProduct.sequelize!.literal('(SELECT DISTINCT productID FROM order_products)')
        },
      },
      limit: 10,
    });

    let resultProducts = [...neverOrderedProducts];

    // 2. If less than 10, fill with slowest-selling products (lowest order count, excluding already selected)
    if (resultProducts.length < 10) {
      const excludedIDs = resultProducts.map(p => p.productID);
      // Find products with the lowest order count, excluding those already in neverOrderedProducts
      const slowProducts = await OrderProduct.findAll({
        attributes: [
          "productID",
          [OrderProduct.sequelize!.fn("COUNT", OrderProduct.sequelize!.col("orderID")), "orderCount"],
        ],
        where: excludedIDs.length > 0 ? {
          productID: { [Op.notIn]: excludedIDs }
        } : {},
        group: ["productID"],
        order: [[OrderProduct.sequelize!.literal("orderCount"), "ASC"]],
        limit: 10 - resultProducts.length,
        include: [
          {
            model: Product,
            as: "product",
          },
        ],
      });
      // For slowProducts, return the associated Product instance (for consistent output)
      const slowProductInstances = slowProducts.map((item: any) => item.product);
      resultProducts = [...resultProducts, ...slowProductInstances];
    }

    // Only return up to 10 products
    res.status(200).json(resultProducts.slice(0, 10));
  } catch (error) {
    console.error("Error fetching poor selling products:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Statistics the number of orders per each product (return all products with their order count)
import OrderProduct from "../models/OrderProduct";

export const getProductsOrderCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get all products
    const products = await Product.findAll({
      order: [["productID", "ASC"]],
    });

    // For each product, count the number of distinct orders containing it
    const orderCounts = await OrderProduct.findAll({
      attributes: [
        "productID",
        [
          OrderProduct.sequelize!.fn(
            "COUNT",
            OrderProduct.sequelize!.col("orderID")
          ),
          "orderCount",
        ],
      ],
      group: ["productID"],
    });

    // Map productID to orderCount
    const orderCountMap: Record<number, number> = {};
    orderCounts.forEach((item: any) => {
      orderCountMap[item.productID] = parseInt(item.get("orderCount"), 10);
    });

    // Attach orderCount to each product
    const productsWithOrderCount = products.map((product: any) => {
      const productJson = product.toJSON();
      return {
        ...productJson,
        orderCount: orderCountMap[product.productID] || 0,
      };
    });

    res.status(200).json(productsWithOrderCount);
  } catch (error) {
    console.error("Error fetching products with order count:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all products will be expired in the next 30 days 
export const getProductsExpiringSoon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const products = await Product.findAll({
      where: {
        expiredAt: {
          [Op.between]: [today, next30Days],
        },
        isShow: true,
      },
      order: [["expiredAt", "ASC"]],
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products expiring soon:", error);
    res.status(500).json({ error: (error as Error).message });
  }
}


// I have just added a new property for Product model called 'order' which is an integer.
// This property is used to sort products based on their order in the list. This helps admin to push poor or slow selling products to the top of the list.
export const updateProductOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productID, order } = req.body;

  if (!productID || typeof order !== "number") {
    res.status(400).json({ message: "Invalid product ID or order value" });
    return;
  }

  try {
    const product = await Product.findByPk(productID);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await product.update({ order });

    res.status(200).json({ message: "Product order updated successfully", product });
  } catch (error) {
    console.error("Error updating product order:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
