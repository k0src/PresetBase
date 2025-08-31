import DB from "./DB.js";

export default class TokenBlacklistManager {
  static async addToBlacklist(jti, expiresAt) {
    try {
      await DB.run(
        `INSERT INTO token_blacklist (jti, expires_at) 
        VALUES (?, ?) ON CONFLICT (jti) DO NOTHING`,
        [jti, expiresAt]
      );
    } catch (err) {
      console.error("Failed to add token to blacklist:", err);
    }
  }

  static async isBlacklisted(jti) {
    try {
      const result = await DB.get(
        `SELECT 1 FROM token_blacklist WHERE jti = ? 
        AND expires_at > CURRENT_TIMESTAMP LIMIT 1`,
        [jti]
      );
      return !!result;
    } catch (err) {
      console.error("Failed to check token blacklist:", err);

      return false;
    }
  }
}
