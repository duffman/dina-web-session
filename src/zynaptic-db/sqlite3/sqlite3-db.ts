/**
 * SQLite Integration
 * @author Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date 2022-03-05
 *
 * Copyright (c) 2022 Coldmind AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 *
 */

import { ZynLogger }               from "../../common/zyn-logger";
import { IDbUpdateOrInsertResult } from "./sqlite3-db.type";
import { SqliteDbType }            from "./sqlite3-db.type";

export class Sqlite3Db {
	public sqlite3: any;
	private db: any;

	constructor(private type: SqliteDbType, public filename: string) {
		switch (type) {
			case SqliteDbType.Sqlite:
				this.sqlite3 = require("sqlite3").verbose();
				break;

			case SqliteDbType.Spatialite:
				this.sqlite3 = require("spatialite");
				break;
		}
	}

	/**
	 * Connect to file based database
	 * @returns {Promise<boolean>}
	 */
	public connect(): Promise<boolean> {
		ZynLogger.logVerbose(`Connecting to database ::`, this.filename);

		return new Promise((resolve, reject) => {
			this.db = new this.sqlite3.Database(this.filename, (err: any) => {
				if (err) {
					ZynLogger.error(`Connection to database "${this.filename}" failed.`, err);
					reject(err);
				} else {
					ZynLogger.info(`Connected to "${this.filename}" SQlite database.`);
					resolve(true);
				}
			});
		});
	}

	public executeBase(query: string): Promise<IDbUpdateOrInsertResult> {
		return new Promise((resolve, reject) => {
			this.db.run(query, function (err: any) {
				if (err) {
					reject(err);
				} else {
					ZynLogger.logVerbose("Sqlite3Db :: executeBase :: LAST ID ::", this.lastID);
					resolve({
						rowId: this.lastID,
						changes: this.changes,
					});
				}
			});
		});
	}

	public modify(query: string, ...values: unknown[]): Promise<number> {
		return new Promise((resolve, reject) => {
			this.db.run(query, values, function (err: any) {
				if (err) {
					reject(err);
				} else {
					ZynLogger.logVerbose("Sqlite3Db :: modify :: LAST ID ::", this.lastID);
					resolve(this.lastID);
				}
			});
		});
	}

	public dbGet(query: string, ...values: unknown[]): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.all(query, values, (err: any, row: any) => {
				if (err) {
					console.error(err.message);
					reject(err);
				} else {
					ZynLogger.logVerbose("Sqlite3Db :: dbGet ::", row);
					resolve(row);
				}
			});
		});
	}

	public spatialGet(query: string, ...values: unknown[]): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.spatialite((err: any) => {
				this.db.get(query, values, (err: any, row: any) => {
					if (err) {
						console.error(err.message);
						reject(err);
					} else {
						console.log("Sqlite3Db :: get ::", row);
						resolve(row);
					}
				});
			});
		});
	}

	public select(query: string, ...values: unknown[]): Promise<any> {
		if (this.type === SqliteDbType.Sqlite) {
			return this.dbGet(query, values);
		} else if (this.type === SqliteDbType.Spatialite) {
			return this.spatialGet(query, values);
		}
	}
}
