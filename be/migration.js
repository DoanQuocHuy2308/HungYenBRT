const db = require('./models');

async function run() {
  try {
    await db.sequelize.query('ALTER TABLE discount_registrations ADD COLUMN PromotionCode VARCHAR(255) NULL;');
    console.log("Success");
  } catch (e) {
    console.error(e);
  }
  process.exit();
}

run();
