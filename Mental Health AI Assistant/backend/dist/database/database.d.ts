import sqlite3 from 'sqlite3';
export declare class Database {
    private db;
    private static instance;
    private constructor();
    static getInstance(): Database;
    initialize(): Promise<void>;
    run(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
    get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
    all<T = any>(sql: string, params?: any[]): Promise<T[]>;
    close(): Promise<void>;
    cleanupOldSessions(hoursOld?: number): Promise<void>;
}
export default Database;
//# sourceMappingURL=database.d.ts.map