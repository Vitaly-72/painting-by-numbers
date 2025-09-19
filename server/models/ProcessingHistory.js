const db = require('../config/database');

class ProcessingHistory {
    static async create(historyData) {
        const { user_id, original_filename, processed_filename, color_count, filter_type, processing_time } = historyData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO processing_history 
                (user_id, original_filename, processed_filename, color_count, filter_type, processing_time) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, original_filename, processed_filename, color_count, filter_type, processing_time],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...historyData });
                }
            );
        });
    }

    static async findByUserId(userId, limit = 20) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM processing_history 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [userId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM processing_history WHERE id = ? AND user_id = ?`,
                [id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    }
}

module.exports = ProcessingHistory;