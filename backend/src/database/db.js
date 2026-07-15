import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  "root",
  process.env.MYSQL_ROOT_PASSWORD,
  {
    host: "db",
    dialect: "mysql",
    logging: false,
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`successfully connected to mysql database`);

    await sequelize.sync({ alter: true });
    console.log(`Database synced successfully`);
  } catch (error) {
    console.error(`error while connecting to database: `, error);
  }
};

export { sequelize, connectDB };
