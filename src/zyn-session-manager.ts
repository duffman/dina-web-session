/**
 * Zynaptic Session Manager
 * ---------------------------------------------
 * Copyright (c) 2021 Coldmind AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 *
 * @author Patrik Forsberg <patrik.forsberg@coldmind.com>
 *
 * @date 2021-01-04
 *
 */

import { ZynSql }           from "./library/zyn-sql/zyn-sql";
import { ZynFindUp }        from "./common/util/zyn-find-up";
import { PathAlias }        from "./common/util/zyn-find-up";
import { ZynPathUtils }     from "./common/util/zyn-path.utils";
import { ZynSession }       from "./zyn-session";
import { IZynSession }      from "./zyn-session.type";
import { ZynLogger }        from "./common/zyn-logger";
import { ZynDbBase }        from "./zynaptic-db/sqlite3/zyn-db-base";
import { join as pathJoin } from "path";
import { existsSync }       from "fs";

export class ZynSessionManager extends ZynDbBase {
	private constructor() {
		super();
		this.openDatabase("{{PROJECT}}/data/session.db3")
	}

	protected static instance: ZynSessionManager;

	public static getInstance(): ZynSessionManager {
		if (!ZynSessionManager.instance) {
			ZynSessionManager.instance = new ZynSessionManager();
		}

		return ZynSessionManager.instance;
	}

	/**
	 * Open database file
	 * @param {string} dbFilename
	 * @returns {boolean}
	 */
	public openDatabase(dbFilename: string): boolean {
		console.log("ZynSessionManager :: openDatabase")
		let result: boolean = false;

		try {
			if (typeof dbFilename === "string" && dbFilename.startsWith(PathAlias.projectRoot)) {
				ZynLogger.info("startsWith ::", PathAlias.projectRoot);
				const findRes = ZynPathUtils.findFileUpwards("zynaptic.json");
				console.log("FindRes ::", findRes);
				dbFilename = dbFilename.substr(PathAlias.projectRoot.length, dbFilename.length)

				dbFilename = pathJoin(findRes, dbFilename);

				console.log(`openDatabase :: "${ dbFilename }"`);

				if (!existsSync(dbFilename)) {
					throw new Error(`Database file "${ dbFilename }" does not exist`);
				} else {
					super.openDatabase(dbFilename, true);
				}
			}
		}
		catch (e) {
			ZynLogger.fatal("open database failed ::", e);
		}

		return result;

		/*
		 this.openDatabase("session.db3")
		 .then((res: boolean) => {
		 ZynLogger.info("ZynSessionManager :: initDatabase :: res ::", res);
		 })
		 .catch((err) => {
		 ZynLogger.error("ZynSessionManager :: initDatabase :: error ::", err);
		 });
		 */
	}

	/**
	 * Assign a property to the session data object
	 * @param {number} sessionId
	 * @param {string} key
	 * @param value
	 * @returns {Promise<boolean>}
	 */
	public async setProperty(sessionId: number, key: string, value: any): Promise<boolean> {
		try {
			let session: IZynSession = await this.getSession(sessionId);
			session.data[ key ]      = value;
			await this.saveSession(sessionId, session.data);
		}
		catch (e) {
			ZynLogger.error("setProperty :: exception", e);
			return false;
		}
	}

	/**
	 * Retrieve session from local storage by session id
	 * @param {number} sessionId
	 * @returns {Promise<IZynSession>}
	 */
	public async getSessionById(sessionId: number): Promise<IZynSession> {
		try {
			let result: IZynSession = undefined;

			const sql = new ZynSql().selectAll("session").where("id", sessionId).toSql();
			ZynLogger.info("getSessionById : SQL :", sql);

			const dbResut = await this.execute(sql);

			ZynLogger.info("getSessionById", `type of -> (${ typeof result }):`, result);

			if (!dbResut) {
				ZynLogger.error(`Session with id "${ sessionId }" does not exist.`);
				result = await this.newSession();
			}
			else {
				const decodedData    = dbResut.data;
				let sessionData: any = {};

				try {
					sessionData = JSON.parse(decodedData);
				}
				catch (e) {
					console.log("Error parsing session data ::", sessionData);
				}

				result = new ZynSession(dbResut.id, sessionData);

				const updateSql = new ZynSql()
					.update("session")
					.set("last_access", Date.now())
					.where("id", sessionId)
					.toSql();

				console.log("update sql:", updateSql);
				await this.execute(updateSql);
			}

			return result;
		}
		catch (e) {
			ZynLogger.error("getSessionById :: exception", e);
			return undefined;
		}
	}

	/**
	 * Create a new session in local storage
	 * @returns {Promise<IZynSession>}
	 */
	public async newSession(): Promise<ZynSession> {
		let session: IZynSession = undefined;
		const sql: string        = new ZynSql()
			.insert(
				{
					created: Date.now(),
					ttl    : 36000,
					data   : "{}",
				},
				"session"
			)
			.toSql();

		ZynLogger.debug("newSession", "SQL:", sql);

		try {
			const res = await this.execute(sql);
			return new ZynSession(res.rowId, {});
		}
		catch (e) {
			ZynLogger.error("newSession :: exception", e);
			return undefined;
		}
	}

	/**
	 * Save session to local storage
	 * @param {number} sessionId
	 * @param data
	 * @returns {Promise<boolean>}
	 */
	public async saveSession(sessionId: number, data: any): Promise<boolean> {
		try {
			//Str.base64Encode(
			data = JSON.stringify(data);

			const sql = new ZynSql()
				.setMulti({ last_access: Date.now(), data: data }, "session")
				.where("id", sessionId)
				.toSql();

			ZynLogger.debug("saveSession", "SQL :", sql);

			const saveResult = await this.execute(sql);

			if (saveResult.changes > 0) {
				return true;
			}

			ZynLogger.debug("saveSession", "result :", saveResult);
		}
		catch (e) {
			ZynLogger.error("getSession :: exception", e);
			return false;
		}
	}

	public async getSession(sessionId?: number): Promise<ZynSession> {
		try {
			if (sessionId) {
				return this.getSessionById(sessionId);
			}
			else {
				return this.newSession();
			}
		}
		catch (e) {
			ZynLogger.error("getSession :: exception", e);
			return undefined;
		}
	}
}

/*
 let sm = new ZynSessionManager();

 async function f() {
 let res = await sm.newSession();

 console.log("New session ::", res);

 const saveRes = await sm.saveSession(res.id, new Date());

 let getRes = await sm.getSessionById(res.id);
 console.log("Get Result ::", getRes);
 }

 f();
 */
