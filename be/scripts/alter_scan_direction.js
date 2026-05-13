const db = require('../models');
db.sequelize.query(
    "ALTER TABLE ticket_logs MODIFY COLUMN scan_direction ENUM('ENTRY', 'EXIT', 'CHECK', 'RESTOCK') NOT NULL;"
).then(() => {
    console.log('ALTER TABLE ticket_logs success: added RESTOCK to scan_direction ENUM');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
