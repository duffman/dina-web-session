/**
 * Taxi Stockholm - Provider
 * @author Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date 2021-09-20
 *
 * Copyright (c) 2021 Netix AB - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential.
 */

export enum SqliteDbType {
	Sqlite,
	Spatialite,
}

export interface IDbUpdateOrInsertResult {
	rowId: number;
	changes: number;
}
