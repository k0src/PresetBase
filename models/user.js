// User model for PresetBase
import DB from "./DB.js";
import bcrypt from "bcrypt";

export default class User {
  static #verifyEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static #verifyUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  }

  static async create({ username, email, password }) {
    if (
      !username ||
      username.length < 3 ||
      username.length > 50 ||
      !User.#verifyUsername(username)
    ) {
      throw new Error("Username must be between 3 and 50 characters");
    }

    if (!email || !User.#verifyEmail(email)) {
      throw new Error("Invalid email address");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const now = new Date().toISOString();

    try {
      const userId = await DB.run(
        `INSERT INTO users 
        (username, email, password_hash, authenticated_with, is_admin, banned, timestamp)
        VALUES (?, ?, ?, 'PresetBase', 'f', 'f', ?)`,
        [
          username.toLowerCase().trim(),
          email.toLowerCase().trim(),
          password_hash,
          now,
        ]
      );

      return {
        id: userId,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        timestamp: now,
        authenticatedWith: "PresetBase",
        isAdmin: "f",
        banned: "f",
      };
    } catch (err) {
      throw new Error(`Failed to create user: ${err.message}`);
    }
  }

  static async createOAuthUser({ username, email, authenticatedWith }) {
    if (
      !username ||
      username.length < 3 ||
      username.length > 50 ||
      !User.#verifyUsername(username)
    ) {
      throw new Error("Username must be between 3 and 50 characters");
    }

    if (!email || !User.#verifyEmail(email)) {
      throw new Error("Invalid email address");
    }

    if (!authenticatedWith) {
      throw new Error("Authentication provider is required");
    }

    const now = new Date().toISOString();

    try {
      const userId = await DB.run(
        `INSERT INTO users 
        (username, email, password_hash, authenticated_with, is_admin, banned, timestamp)
        VALUES (?, ?, NULL, ?, 'f', 'f', ?)`,
        [
          username.toLowerCase().trim(),
          email.toLowerCase().trim(),
          authenticatedWith,
          now,
        ]
      );

      return {
        id: userId,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        timestamp: now,
        authenticatedWith,
        isAdmin: "f",
        banned: "f",
      };
    } catch (err) {
      throw new Error(`Failed to create OAuth user: ${err.message}`);
    }
  }

  static async getById(id) {
    try {
      const user = await DB.get(`SELECT * FROM users WHERE id = ?`, [id]);
      if (!user) return null;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        timestamp: user.timestamp,
        authenticatedWith: user.authenticated_with,
        isAdmin: user.is_admin,
        banned: user.banned,
      };
    } catch (err) {
      throw new Error(`Failed to get user by ID: ${err.message}`);
    }
  }

  static async getFullDataById(id) {
    try {
      const user = await DB.get(`SELECT * FROM users WHERE id = ?`, [id]);
      if (!user) return null;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        timestamp: user.timestamp,
        authenticatedWith: user.authenticated_with,
        isAdmin: user.is_admin,
        banned: user.banned,
      };
    } catch (err) {
      throw new Error(`Failed to get user by ID: ${err.message}`);
    }
  }

  static async getByEmail(email) {
    try {
      const user = await DB.get(`SELECT * FROM users WHERE email = ?`, [
        email.toLowerCase().trim(),
      ]);
      if (!user) return null;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        timestamp: user.timestamp,
        authenticatedWith: user.authenticated_with,
        isAdmin: user.is_admin,
        banned: user.banned,
      };
    } catch (err) {
      throw new Error(`Failed to get user by email: ${err.message}`);
    }
  }

  static async getByUsername(username) {
    try {
      const user = await DB.get(`SELECT * FROM users WHERE username = ?`, [
        username.toLowerCase().trim(),
      ]);
      if (!user) return null;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        timestamp: user.timestamp,
        authenticatedWith: user.authenticated_with,
        isAdmin: user.is_admin,
        banned: user.banned,
      };
    } catch (err) {
      throw new Error(`Failed to get user by username: ${err.message}`);
    }
  }

  static async updatePassword(id, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    try {
      await DB.run(`UPDATE users SET password_hash = ? WHERE id = ?`, [
        password_hash,
        id,
      ]);
    } catch (err) {
      throw new Error(`Failed to update password: ${err.message}`);
    }
  }

  static async updateUsername(id, newUsername) {
    if (
      !newUsername ||
      newUsername.length < 3 ||
      newUsername.length > 50 ||
      !User.#verifyUsername(newUsername)
    ) {
      throw new Error("Username must be between 3 and 50 characters");
    }

    try {
      await DB.run(`UPDATE users SET username = ? WHERE id = ?`, [
        newUsername.toLowerCase().trim(),
        id,
      ]);
    } catch (err) {
      throw new Error(`Failed to update username: ${err.message}`);
    }
  }

  static async updateEmail(id, newEmail) {
    if (!newEmail || !User.#verifyEmail(newEmail)) {
      throw new Error("Invalid email address");
    }

    try {
      await DB.run(`UPDATE users SET email = ? WHERE id = ?`, [
        newEmail.toLowerCase().trim(),
        id,
      ]);
    } catch (err) {
      throw new Error(`Failed to update email: ${err.message}`);
    }
  }

  static async verifyPassword(password, hash) {
    try {
      if (!password || !hash) return false;
      return await bcrypt.compare(password, hash);
    } catch (err) {
      throw new Error(`Failed to verify password: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      await DB.run(`DELETE FROM users WHERE id = ?`, [id]);
      await DB.run(`DELETE FROM pending_submissions WHERE user_id = ?`, [id]);
    } catch (err) {
      throw new Error(`Failed to delete user: ${err.message}`);
    }
  }

  static async deleteById(id) {
    try {
      await DB.run(`DELETE FROM users WHERE id = ?`, [id]);
      await DB.run(`DELETE FROM pending_submissions WHERE user_id = ?`, [id]);
    } catch (err) {
      throw new Error(`Failed to delete user: ${err.message}`);
    }
  }

  static async updateById(id, data) {
    try {
      await DB.beginTransaction();

      // Update main song data
      const fields = [];
      const params = [];

      if (data.username) {
        fields.push("username = ?");
        params.push(data.username);
      }

      if (data.email) {
        fields.push("email = ?");
        params.push(data.email);
      }

      if (data.authenticatedWith) {
        fields.push("authenticated_with = ?");
        params.push(data.authenticatedWith);
      }

      if (data.isAdmin) {
        fields.push("is_admin = ?");
        params.push(data.isAdmin);
      }

      if (data.banned) {
        fields.push("banned = ?");
        params.push(data.banned);
      }

      if (fields.length > 0) {
        params.push(id);
        await DB.run(
          `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
          params
        );
      }

      await DB.commit();
    } catch (err) {
      await DB.rollback();
      throw new Error(`Error updating user ${id}: ${err.message}`);
    }
  }

  static async update(id, updates) {
    const allowedFields = ["username", "email"];

    try {
      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field) && value !== undefined) {
          if (field === "username") {
            await User.updateUsername(id, value);
          } else if (field === "email") {
            await User.updateEmail(id, value);
          }
        }
      }

      return await User.getById(id);
    } catch (err) {
      throw new Error(`Failed to update user: ${err.message}`);
    }
  }

  static async getPendingSubmissions(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const submissions = await DB.all(
        `SELECT * FROM pending_submissions WHERE user_id = ?`,
        [userId]
      );

      if (submissions) {
        for (const submission of submissions) {
          submission.data = JSON.parse(submission.data);
        }
      }
      return submissions;
    } catch (err) {
      throw new Error(`Failed to get pending submissions: ${err.message}`);
    }
  }

  static async getApprovedSubmissions(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const submissions = await DB.all(
        `
        SELECT
          songs.title AS songTitle,
          songs.id AS songId,
          songs.image_url AS songImage,
          artists.name AS artistName,
          song_presets.timestamp,
          json_group_array(
            json_object(
              'synthName', synths.synth_name,
              'presetName', presets.preset_name
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
        GROUP BY songs.id`,
        [userId]
      );

      if (submissions) {
        for (const submission of submissions) {
          submission.presets = JSON.parse(submission.presets || "[]");
        }
      }

      return submissions;
    } catch (err) {
      throw new Error(`Failed to get approved submissions: ${err.message}`);
    }
  }

  static async deletePendingSubmission(userId, submissionId) {
    try {
      // Check for ownership
      const submission = await DB.get(
        `SELECT * FROM pending_submissions WHERE id = ? AND user_id = ?`,
        [submissionId, userId]
      );

      if (!submission) {
        throw new Error("Submission not found or does not belong to user");
      }

      await DB.run(`DELETE FROM pending_submissions WHERE id = ?`, [
        submissionId,
      ]);
    } catch (err) {
      throw new Error(`Failed to delete pending submission: ${err.message}`);
    }
  }

  // Get all users
  static async getAll(
    sort = "users.timestamp",
    direction = "ASC",
    limit = null
  ) {
    try {
      // For case-insensitive sorting
      const textFields = [
        "users.username",
        "users.email",
        "users.authenticated_with",
      ];
      const sortClause = textFields.includes(sort)
        ? `${sort} COLLATE NOCASE ${direction}`
        : `${sort} ${direction}`;

      const query = `
        SELECT
          users.id AS id,
          users.username AS username,
          users.email AS email,
          users.password_hash AS passwordHash,
          users.is_admin AS isAdmin,
          users.authenticated_with AS authenticatedWith,
          users.banned AS banned,
          users.timestamp AS timestamp
        FROM users
        ORDER BY ${sortClause}
        ${limit ? "LIMIT ?" : ""}`;

      const params = [];
      if (limit) params.push(limit);
      return await DB.all(query, params);
    } catch (err) {
      throw new Error(`Error fetching all users: ${err.message}`);
    }
  }

  // static async setAdmin(id) {
  //   try {
  //     await DB.run(`UPDATE users SET is_admin = 't' WHERE id = ?`, [id]);
  //     return true;
  //   } catch (err) {
  //     throw new Error(`Failed to set admin: ${err.message}`);
  //   }
  // }

  // static async unsetAdmin(id) {
  //   try {
  //     await DB.run(`UPDATE users SET is_admin = 'f' WHERE id = ?`, [id]);
  //     return true;
  //   } catch (err) {
  //     throw new Error(`Failed to unset admin: ${err.message}`);
  //   }
  // }

  // static async isAdmin(id) {
  //   try {
  //     const user = await DB.get(`SELECT is_admin FROM users WHERE id = ?`, [
  //       id,
  //     ]);
  //     return user ? user.is_admin === "t" : false;
  //   } catch (err) {
  //     throw new Error(`Failed to check admin status: ${err.message}`);
  //   }
  // }

  // static async getUserSubmissions(id) {
  //   try {
  //     const query = `
  //       SELECT
  //       songs.title AS song_title,
  //       songs.id AS song_id,
  //       songs.image_url AS song_image,
  //       artists.name AS artist_name,
  //       song_presets.timestamp,
  //       json_group_array(
  //         json_object(
  //           'synth_name', synths.synth_name,
  //           'preset_name', presets.preset_name
  //         )
  //       ) AS presets
  //       FROM presets
  //       LEFT JOIN preset_synths ON
  //         presets.id = preset_synths.preset_id
  //       LEFT JOIN synths ON
  //         preset_synths.synth_id = synths.id
  //       LEFT JOIN song_presets ON
  //         presets.id = song_presets.preset_id
  //       LEFT JOIN songs ON
  //         song_presets.song_id = songs.id
  //       LEFT JOIN song_artists ON
  //         songs.id = song_artists.song_id
  //       LEFT JOIN artists ON
  //         song_artists.artist_id = artists.id
  //       LEFT JOIN user_submissions ON
  //         song_presets.id = user_submissions.submission_id
  //       WHERE song_artists.role = 'Main' AND user_submissions.user_id = ?
  //       GROUP BY songs.id`;

  //     const submission = await dbAll(query, [id]);
  //     return submission.map((s) => ({
  //       song_title: s.song_title,
  //       song_id: s.song_id,
  //       song_image: s.song_image,
  //       artist_name: s.artist_name,
  //       timestamp: s.timestamp,
  //       presets: JSON.parse(s.presets || "[]"),
  //     }));
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }

  // static async getUserPendingSubmissions(id) {
  //   try {
  //     const submissions = await dbAll(
  //       `SELECT
  //         id,
  //         data,
  //         submitted_at
  //       FROM pending_submissions
  //       WHERE user_id = ?`,
  //       [id]
  //     );

  //     return submissions.map((s) => ({
  //       id: s.id,
  //       data: JSON.parse(s.data),
  //       submitted_at: s.submitted_at,
  //     }));
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }

  // // Returns user data as object
  // static async getUserData(id) {
  //   try {
  //     const user = await User.getUserById(id);
  //     if (!user) {
  //       throw new Error("User not found");
  //     }

  //     const timestamp = await User.getUserTimestamp(id);
  //     const submissions = await User.getUserSubmissions(id);
  //     const pendingSubmissions = await User.getUserPendingSubmissions(id);

  //     return {
  //       id: user.id,
  //       email: user.email,
  //       username: user.username,
  //       authenticated_with: user.authenticated_with,
  //       is_admin: user.is_admin,
  //       banned: user.banned,
  //       timestamp,
  //       submissions,
  //       pendingSubmissions,
  //     };
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }

  // // Returns all user data including submissions and pending submissions, as objects
  // static async getAllUsersData(sortKey = null, sortDirection = "ASC") {
  //   try {
  //     const users = await dbAll(
  //       `SELECT * FROM users ORDER BY ${sortKey} ${sortDirection}`
  //     );

  //     for (const user of users) {
  //       user.submissions = await User.getUserSubmissions(user.id);
  //       user.pendingSubmissions = await User.getUserPendingSubmissions(user.id);
  //     }

  //     return users;
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }

  // static async exists(id) {
  //   try {
  //     const user = await dbGet(`SELECT id FROM users WHERE id = ?`, [id]);
  //     return !!user;
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }

  // static async banUser(id) {
  //   try {
  //     await dbRun(`UPDATE users SET banned = 't' WHERE id = ?`, [id]);
  //     return true;
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }

  // static async unbanUser(id) {
  //   try {
  //     await dbRun(`UPDATE users SET banned = 'f' WHERE id = ?`, [id]);
  //     return true;
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }
}

// module.exports = User;
