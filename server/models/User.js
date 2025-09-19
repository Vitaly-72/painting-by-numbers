const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { email, password, username } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (email, password, username) VALUES (?, ?, ?)`,
                [email, hashedPassword, username],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, email, username });
                }
            );
        });
    }

    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE email = ?`,
                [email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id, email, username, created_at FROM users WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;