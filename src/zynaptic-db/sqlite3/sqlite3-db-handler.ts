/**
 * provider-taxistockholm
 * @author Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date 2021-08-13
 *
 * Copyright (c) 2021 Netix AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 *
 * @desc: Implement this interface when creating Database Handlers
 *
 */

import { SqliteDbType } from "./sqlite3-db.type";

export interface ISqlite3DbHandler {
	initDatabase(dbFilename: string, dbType: SqliteDbType, dbPath: string): Promise<boolean>;
}
