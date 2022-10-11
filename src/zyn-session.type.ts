/**
 * Zynaptic Session - Types
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

export const KEY_SESSION_ID = "zyn_device_id"

export interface IZynSession {
	id: number;
	data: any;

	save(): Promise<boolean>;
	setProperty(key: string, value: any): Promise<boolean>;
	getProperty(key: string): Promise<string>;
	clear(): Promise<boolean>;
}
