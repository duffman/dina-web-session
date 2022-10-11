/**
 * Zynaptic Session Middleware for Express.js
 * ---------------------------------------------
 * Copyright (c) 2021 Coldmind AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 *
 * @author Patrik Forsberg <patrik.forsberg@coldmind.com>
 *
 * @date 2021-01-05
 *
 */

import { ZynVarUtils }       from "./common/util/zyn-var.utils";
import { ZynLogger }         from "./common/zyn-logger";
import { ZynSession }        from "./zyn-session";
import { ZynSessionManager } from "./zyn-session-manager";
import { KEY_SESSION_ID }    from "./zyn-session.type";
import { Request }           from "express";
import { Response }          from "express";
import { NextFunction }      from "express";

const uuid = require("uuid");

export async function ZynapticSession(req: Request, resp: Response, next: NextFunction): Promise<void> {
	try {
		//const manager: ZynSessionManager = container.resolve(ZynSessionManager);
		let session: ZynSession     = undefined;

		if (req.headers[ KEY_SESSION_ID ] && ZynVarUtils.isNumeric(req.headers[ KEY_SESSION_ID ])) {
			session = await ZynSessionManager.getInstance().getSession(
				Number(req.headers[ KEY_SESSION_ID ])
			);
		}

		if (!session) {
			session = await ZynSessionManager.getInstance().newSession();
		}

		const currDeviceId = await session.getProperty(KEY_SESSION_ID);

		if (isNaN(currDeviceId as unknown as number)) {
			// No Device ID FOUND - GENERATING
			let deviceId = uuid.v1();

			session.setProperty(KEY_SESSION_ID, deviceId);
		}

		req.zynSessionId = session?.id;
		req.zynSession   = session;

		resp.setHeader(KEY_SESSION_ID, req.zynSessionId);
	}
	catch (e) {
		ZynLogger.error("ZynapticSession", e);
	}

	return next();
}
