import db from "../db/db.js";

export default class DB {
  static all(query, params = []) {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static get(query, params = []) {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static run(query, params = []) {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  static async beginTransaction() {
    await this.run("BEGIN TRANSACTION");
  }

  static async commit() {
    await this.run("COMMIT");
  }

  static async rollback() {
    await this.run("ROLLBACK");
  }
}
