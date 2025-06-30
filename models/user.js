const { dbGet, dbRun, dbAll } = require("./UTIL");

class User {
  constructor(id = null, email, username, is_admin = false) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.timestamp = new Date().toISOString();
    this.is_admin = is_admin;
  }

  static async getUserById(id) {
    try {
      const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [id]);
      if (!user) return null;
      return new User(
        user.id,
        user.email,
        user.username,
        user.is_admin === "t"
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email]);
      if (!user) return null;
      return new User(
        user.id,
        user.email,
        user.username,
        user.is_admin === "t"
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async deleteUserById(id) {
    try {
      await dbRun(`DELETE FROM users WHERE id = ?`, [id]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async createUser({ email, username }) {
    try {
      const now = new Date().toISOString();
      const result = await dbRun(
        `INSERT INTO users (email, username, timestamp) VALUES (?, ?, ?)`,
        [email, username, now]
      );
      return new User(result, email, username);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async isAdmin() {
    return !!this.is_admin;
  }
}

module.exports = User;
