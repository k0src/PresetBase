const { dbGet, dbRun, dbAll, formatDate } = require("./UTIL");

class User {
  constructor(
    id = null,
    email,
    username,
    authenticated_with = null,
    is_admin = false,
    banned = false
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.authenticated_with = authenticated_with;
    this.is_admin = is_admin;
    this.banned = banned;
  }

  static async getUserById(id) {
    try {
      const user = await dbGet(`SELECT * FROM users WHERE id = ?`, [id]);
      if (!user) return null;
      return new User(
        user.id,
        user.email,
        user.username,
        user.authenticated_with,
        user.is_admin === "t",
        user.banned === "t"
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
        user.authenticated_with,
        user.is_admin === "t",
        user.banned === "t"
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
      const id = await dbRun(
        `INSERT INTO users 
            (email, username, authenticated_with, timestamp, is_admin, banned) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [email, username, authenticated_with, now, "f", "f"]
      );
      return new User(id, email, username, authenticated_with);
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

  static async getUserTimestamp(id) {
    try {
      const user = await dbGet(`SELECT timestamp FROM users WHERE id = ?`, [
        id,
      ]);
      return user ? user.timestamp : null;
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

  static async getUserSubmissions(id) {
    try {
      const query = `
        SELECT
        songs.title AS song_title,
        songs.id AS song_id,
        songs.image_url AS song_image,
        artists.name AS artist_name,
        song_presets.timestamp,
        json_group_array(
          json_object(
            'synth_name', synths.synth_name,
            'preset_name', presets.preset_name
          )
        ) AS presets
        FROM presets
        LEFT JOIN preset_synths ON 
          presets.id = preset_synths.preset_id
        LEFT JOIN synths ON 
          preset_synths.synth_id = synths.id
        LEFT JOIN song_presets ON 
          presets.id = song_presets.preset_id
        LEFT JOIN songs ON 
          song_presets.song_id = songs.id
        LEFT JOIN song_artists ON 
          songs.id = song_artists.song_id
        LEFT JOIN artists ON 
          song_artists.artist_id = artists.id
        LEFT JOIN user_submissions ON 
          song_presets.id = user_submissions.submission_id
        WHERE song_artists.role = 'Main' AND user_submissions.user_id = ?
        GROUP BY songs.id`;

      const submission = await dbAll(query, [id]);
      return submission.map((s) => ({
        song_title: s.song_title,
        song_id: s.song_id,
        song_image: s.song_image,
        artist_name: s.artist_name,
        timestamp: s.timestamp,
        presets: JSON.parse(s.presets || "[]"),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async getUserPendingSubmissions(id) {
    try {
      const submissions = await dbAll(
        `SELECT
          id, 
          data,
          submitted_at 
        FROM pending_submissions 
        WHERE user_id = ?`,
        [id]
      );

      return submissions.map((s) => ({
        id: s.id,
        data: JSON.parse(s.data),
        submitted_at: s.submitted_at,
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Returns all user data including submissions and pending submissions, as objects
  static async getAllUserData(sortKey = null) {
    try {
      const users = await dbAll(`SELECT * FROM users ORDER BY ${sortKey}`);

      for (const user of users) {
        user.submissions = await User.getUserSubmissions(user.id);
        user.pendingSubmissions = await User.getUserPendingSubmissions(user.id);
      }

      return users;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async exists(id) {
    try {
      const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
      return !!user;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async banUser(id) {
    try {
      await dbRun(`UPDATE users SET banned = 't' WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async unbanUser(id) {
    try {
      await dbRun(`UPDATE users SET banned = 'f' WHERE id = ?`, [id]);
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

module.exports = User;
