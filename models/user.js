const { dbGet, dbRun, dbAll } = require("./UTIL");

class User {
  constructor(
    id = null,
    email,
    username,
    is_admin = false,
    authenticated_with = null
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.timestamp = new Date().toISOString();
    this.is_admin = is_admin;
    this.authenticated_with = authenticated_with;
  }

  static async getUserById(id) {
    try {
      const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [id]);
      if (!user) return null;
      return new User(
        user.id,
        user.email,
        user.username,
        user.is_admin === "t",
        user.authenticated_with
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
        user.is_admin === "t",
        user.authenticated_with
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

  static async createUser({ email, username, authenticated_with = null }) {
    try {
      const now = new Date().toISOString();
      const result = await dbRun(
        `INSERT INTO users 
            (email, username, timestamp, is_admin, authenticated_with) 
        VALUES (?, ?, ?, ?, ?)`,
        [email, username, now, "f", authenticated_with]
      );
      return new User(result, email, username, false, authenticated_with);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static #verifyUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  }

  static async setUsername(id, newUsername) {
    try {
      if (!User.#verifyUsername(newUsername)) {
        throw new Error("Invalid username format");
      }

      await dbRun(`UPDATE users SET username = ? WHERE id = ?`, [
        newUsername,
        id,
      ]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async setUsername(newUsername) {
    try {
      if (!User.#verifyUsername(newUsername)) {
        throw new Error("Invalid username format");
      }

      await dbRun(`UPDATE users SET username = ? WHERE id = ?`, [
        newUsername,
        this.id,
      ]);
      this.username = newUsername;
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async setAdmin(id) {
    try {
      await dbRun(`UPDATE users SET is_admin = 't' WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async unsetAdmin(id) {
    try {
      await dbRun(`UPDATE users SET is_admin = 'f' WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async isAdmin() {
    return !!this.is_admin;
  }

  static async #deleteAllUserData(id) {
    try {
      await dbRun(`DELETE FROM user_submissions WHERE user_id = ?`, [id]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async deleteAccountById(id) {
    try {
      await dbRun(`DELETE FROM users WHERE id = ?`, [id]);
      await User.#deleteAllUserData(id);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = User;
