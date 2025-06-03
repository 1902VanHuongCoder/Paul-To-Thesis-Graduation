import {DataTypes, Model} from 'sequelize';
import sequelize from '../configs/mysql-database-connect';

class Contact extends Model {
    public contactID!: number;
    public userID!: string;
    public subject!: string;
    public message!: string;
    public status!: string; // e.g., 'open', 'closed', 'in-progress'
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Contact.init(
    {
        contactID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userID: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'users', // Assuming you have a User model
                key: 'userID',
            },
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'open',
        },
    },
    {
        sequelize,
        tableName: 'contacts',
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export default Contact;