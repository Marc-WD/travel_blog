
// Run with: node scripts/cleanup.js
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    const db = mongoose.connection.db;
    const coll = db.collection('posts');
    // Drop lingering slug unique index if it exists
    try {
      await coll.dropIndex('slug_1');
      console.log('Dropped index slug_1');
    } catch (e) {
      console.log('No slug_1 index to drop (ok)');
    }
    // Remove image field from all docs
    const res = await coll.updateMany({}, { $unset: { image: "" } });
    console.log('Unset image field on', res.modifiedCount, 'documents');
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
