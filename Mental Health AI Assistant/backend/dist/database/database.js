"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Database {
    constructor() {
        // Create database directory if it doesn't exist
        const dbDir = path_1.default.join(__dirname, '../../data');
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        const dbPath = path_1.default.join(dbDir, 'mental_health_assistant.db');
        this.db = new sqlite3_1.default.Database(dbPath);
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async initialize() {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log('Database initialized successfully');
                    resolve();
                }
            });
        });
    }
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // Cleanup old sessions (for privacy)
    async cleanupOldSessions(hoursOld = 24) {
        const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();
        await this.run('DELETE FROM sessions WHERE last_activity < ?', [cutoffTime]);
    }
}
exports.Database = Database;
exports.default = Database;
//# sourceMappingURL=database.js.map