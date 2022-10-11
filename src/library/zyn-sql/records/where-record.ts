/**
 * The file is part of the ZynapticSQL project
 * Copyright (C) 2020 Patrik Forsberg <patrik.forsberg@coldmind.com>
 * Licensed under the GNU Lesser General Public License, Version 3.0
 * Find a full copy of the license in the LICENSE.md file located in the project root.
 */

import { CompareType, IDRecord } from "../types";

export class DWhere implements IDRecord {
	constructor(public data: any, public value2: any = null, public whereType: CompareType = CompareType.Equal) {}
}

export class DOrWhere extends DWhere implements IDRecord {}

export class DAndWhere extends DWhere implements IDRecord {}

export class DAndOrWhere extends DWhere implements IDRecord {}

export class DOrAndWhere extends DWhere implements IDRecord {}

export class DWhereSimple implements IDRecord {
	constructor(
		public value1: any,
		public value2: any = null,
		public whereType: CompareType = CompareType.Equal,
		public escape: boolean = true
	) {}
}

export class DWhereBetween implements IDRecord {
	constructor(public type: CompareType, public that: any, public value1: any, public value2?: any) {}
}

export class DWhereMulti implements IDRecord {
	constructor(public data: any, public tableName: string) {}
}
