/**
 * Zynaptic Logger
 * ---------------------------------------------
 * Copyright (c) 2021 Coldmind AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 *
 * @author Patrik Forsberg <patrik.forsberg@coldmind.com>
 *
 * @date 2021-08-05
 *
 * @desc: Simple Logging Utility that wraps the console,
 * extend and use with custom app ZynLogger
 *
 */

const log = console.log;
const debug = console.debug;
const error = console.error;

export class ZynLogger {
	public static log(...data: Array<any>): void {
		debug(data);
	}

	public static logVerbose(...data: Array<any>): void {
		log(data);
	}

	public static debug(...data: Array<any>): void {
		debug(data);
	}

	public static error(...data: Array<any>): void {
		error(data);
	}

	public static info(...data: any[]): void {
		log(":: INFO ::", data);
	}

	public static fatal(message: string, ...data: Array<any>): void {
		error(`:: INFO :: ${message} ::`, data);
	}

	public static message(value: string, data?: any): void {
		error(`:: MESSAGE :: ${value} ::`, data);
	}
}
