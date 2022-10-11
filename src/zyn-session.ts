/**
 * Zynaptic Session
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

import { ZynLogger }         from "./common/zyn-logger";
import { IZynSession }       from "./zyn-session.type";
import { ZynSessionManager } from "./zyn-session-manager";

export {};

declare global {
	namespace Express {
		export interface Request {
			zynSessionId: number;
			zynSession: ZynSession;
		}
	}
}

export class ZynSession implements IZynSession {
	constructor(public id: number, public data: any) {}

	public async save(): Promise<boolean> {
		try {
			let session = ZynSessionManager.getInstance().getSessionById(this.id);
			await ZynSessionManager.getInstance().saveSession(this.id, this.data);
;
			return true;
		} catch (e) {
			ZynLogger.error("ZynSession :: save ::", e);
			return false;
		}
	}

	/**
	 * Clear session data
	 * @returns {Promise<boolean>}
	 */
	public async clear(): Promise<boolean> {
		try {
			this.data = {};
			await this.save();
		} catch (e) {
			ZynLogger.error("ZynSession :: save ::", e);
			return false;
		}
	}

	/**
	 * assign a property to the session data
	 * @param {string} key
	 * @param value
	 * @returns {Promise<boolean>}
	 */
	public async setProperty(key: string, value: any): Promise<boolean> {
		try {
			this.data[key] = value;
			return await this.save();
		} catch (e) {
			ZynLogger.error("setProperty :: exception", e);
			return false;
		}
	}

	public async getProperty(key: string): Promise<string> {
		try {
			return this.data[key] as string;
		} catch (e) {
			ZynLogger.error("getProperty :: exception", e);
		}
	}
}
