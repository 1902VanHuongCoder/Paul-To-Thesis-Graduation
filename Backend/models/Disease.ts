import {DataTypes, Model} from 'sequelize';
import sequelize from '../configs/mysql-database-connect';

class Disease extends Model {
    public diseaseID!: number;
    public userID!: string;
    public diseaseName!: string;
    public diseaseEnName!: string;
    public ricePathogen!: string;
    public symptoms!: string;
    public images!: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Disease.init(
    {
        diseaseID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userID: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users',
                key: 'userID',
            },
        },
        diseaseName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        diseaseEnName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ricePathogen: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        symptoms: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        images: {
            type: DataTypes.TEXT, // Store as JSON string
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('images');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(val: string[] | undefined) {
                this.setDataValue('images', val ? JSON.stringify(val) : null);
            },
        },
    },
    {
        sequelize,
        tableName: 'diseases',
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export default Disease;