/**
 * Zynaptic Logger
 * ---------------------------------------------
 * Copyright (c) 2021 Coldmind AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 *
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 *
 * @date: 2021-05-11 12:56
 *
 * @desc: Simple Logging Utility that wraps the console,
 * extend and use with custom app ZynLogger
 *
 */
import { ZynFindUp } from "./zyn-find-up";

export class ZynPathUtils {
	public static findFileUpwards(filename: string, startPath: string = __dirname): string {
		let result = startPath;
		const res = ZynFindUp.findFile(startPath, filename);

		if (res.fileFound) {
			result = res.path;
		}

		return result;
	}

	/**
	 * Locate the package.json file marking the project root
	 * @param {string} startPath
	 * @returns {string}
	 */
	public static getProjectRoot(startPath: string = __dirname): string {
		return ZynPathUtils.findFileUpwards("package.json");
	}
}
