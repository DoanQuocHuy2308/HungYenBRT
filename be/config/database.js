const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false
  }
);

const checkConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

module.exports = { sequelize, checkConnect };