import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import { Product, ShoppingCart } from "./index";

class About extends Model {
  //   public aboutID!: number;
  public companyPhone!: string;
  public companyEmail!: string;
  public copanyAddress!: string;
  public companyDescription!: string;
  public companyLogo!: string;
  public companyName!: string;
  public companySlogan!: string;
  public companyFacebook!: string;
  public companyWorkingTime!: string;
  public companyImage!: string;
  public termsAndPolicy!: string;
  public isActive!: boolean;
}

About.init(
  {
    // aboutID: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true,
    //   autoIncrement: true,
    // },
    companyPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    copanyAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyLogo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companySlogan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyFacebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyWorkingTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    termsAndPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    accessCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "About",
    tableName: "about",
  }
);

export default About;
