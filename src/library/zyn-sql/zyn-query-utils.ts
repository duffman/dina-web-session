/**
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: February 2018
 *
 * Partly based on DynUtils
 * https://github.com/mysqljs/sqlstring/blob/master/lib/DynUtils.js
 */

const ID_GLOBAL_REGEXP = /`/g;
const QUAL_GLOBAL_REGEXP = /\./g;
const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
const CHARS_ESCAPE_MAP = {
	"\0": "\\0",
	"\b": "\\b",
	"\t": "\\t",
	"\n": "\\n",
	"\r": "\\r",
	"\x1a": "\\Z",
	'"': '\\"',
	"'": "\\'",
	"\\": "\\\\",
};

import { CompareType } from "./types";

export enum VarType {
	None,
	NullOrUndefined,
	String,
	Number,
	Boolean,
	Object,
	Date,
	Array,
	Buffer,
}

export class ZynQueryUtils {
	public static prepMySqlDate(dateObj: Date): string {
		dateObj.setHours(dateObj.getHours() - 2);
		return dateObj.toISOString().slice(0, 19).replace("T", " ");
	}

	public static parseCompareType(value1: any, value2: any, whereType: CompareType) {
		let sql = "";

		switch (whereType) {
			case CompareType.Equal:
				sql = value1 + " = " + ZynQueryUtils.escape(value2);
				break;

			// Equal (Safe to compare NULL values)
			case CompareType.SafeEqual:
				sql = value1 + " <=> " + ZynQueryUtils.escape(value2);
				break;

			case CompareType.GreaterThan:
				sql = value1 + " > " + ZynQueryUtils.escape(value2);
				break;

			case CompareType.GreaterOrEquals:
				sql = value1 + " >= " + ZynQueryUtils.escape(value2);
				break;

			case CompareType.LessThan:
				sql = value1 + " < " + ZynQueryUtils.escape(value2);
				break;

			case CompareType.LessOrEquals:
				sql = value1 + " <= " + ZynQueryUtils.escape(value2);
				break;

			case CompareType.Between:
				sql = "BETWEEN " + ZynQueryUtils.escape(value1) + " AND " + ZynQueryUtils.escape(value2);
				break;

			case CompareType.Or:
				sql = value1 + " <= " + ZynQueryUtils.escape(value2);
				break;
			default: {
				sql = "UNKNOWN_DIRECTIVE";
			}
		}

		return sql;
	}

	public static escapeId(val: any, forbidQualified = false): string {
		if (Array.isArray(val)) {
			let sql = "";

			for (let i = 0; i < val.length; i++) {
				sql += (i === 0 ? "" : ", ") + ZynQueryUtils.escapeId(val[i], forbidQualified);
			}

			return sql;
		} else if (forbidQualified) {
			return "`" + String(val).replace(ID_GLOBAL_REGEXP, "``") + "`";
		} else {
			return "`" + String(val).replace(ID_GLOBAL_REGEXP, "``").replace(QUAL_GLOBAL_REGEXP, "`.`") + "`";
		}
	}

	/**
	 *
	 * @param val
	 * @param stringifyObjects
	 * @param timeZone
	 */
	public static escape(val: any, stringifyObjects = true, timeZone = 0): string {
		if (val === undefined || val === null) {
			return "NULL";
		}

		switch (typeof val) {
			case "boolean":
				return val ? "true" : "false";
			case "number":
				return val + "";
			case "object":
				if (val instanceof Date) {
					return ZynQueryUtils.dateToString(val, timeZone || "local");
				} else if (Array.isArray(val)) {
					return ZynQueryUtils.arrayToList(val, timeZone);
				} else if (Buffer.isBuffer(val)) {
					return ZynQueryUtils.bufferToString(val);
				} else if (typeof val.toDynUtils === "function") {
					return String(val.toDynUtils());
				} else if (stringifyObjects) {
					return ZynQueryUtils.escapeString(val.toString());
				} else {
					return ZynQueryUtils.objectToValues(val, timeZone);
				}
			default:
				return ZynQueryUtils.escapeString(val);
		}
	}

	public static arrayToList(array: any[], timeZone: number) {
		let sql = "";

		for (let i = 0; i < array.length; i++) {
			let val = array[i];

			if (Array.isArray(val)) {
				sql += (i === 0 ? "" : ", ") + "(" + ZynQueryUtils.arrayToList(val, timeZone) + ")";
			} else {
				sql += (i === 0 ? "" : ", ") + ZynQueryUtils.escape(val, true, timeZone);
			}
		}

		return sql;
	}

	public static format(sql: string, values: any[], stringifyObjects: boolean, timeZone: number) {
		if (values == null) {
			return sql;
		}

		if (!(values instanceof Array || Array.isArray(values))) {
			values = [values];
		}

		let chunkIndex = 0;
		let placeholdersRegex = /\?+/g;
		let result = "";
		let valuesIndex = 0;
		let match;

		while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
			let len = match[0].length;

			if (len > 2) {
				continue;
			}

			let value =
					len === 2
					? ZynQueryUtils.escapeId(values[valuesIndex])
					: ZynQueryUtils.escape(values[valuesIndex], stringifyObjects, timeZone);

			result += sql.slice(chunkIndex, match.index) + value;
			chunkIndex = placeholdersRegex.lastIndex;
			valuesIndex++;
		}

		if (chunkIndex === 0) {
			// Nothing was replaced
			return sql;
		}

		if (chunkIndex < sql.length) {
			return result + sql.slice(chunkIndex);
		}

		return result;
	}

	public static dateToString(date: any, timeZone: any): string {
		let dt = new Date(date);

		if (isNaN(dt.getTime())) {
			return "NULL";
		}

		let year, month, day, hour, minute, second, millisecond: number;

		if (timeZone === "local") {
			year = dt.getFullYear();
			month = dt.getMonth() + 1;
			day = dt.getDate();
			hour = dt.getHours();
			minute = dt.getMinutes();
			second = dt.getSeconds();
			millisecond = dt.getMilliseconds();
		} else {
			let tz = ZynQueryUtils.convertStrToTimezone(timeZone);

			if (tz != 0) {
				dt.setTime(dt.getTime() + tz * 60000);
			}

			year = dt.getUTCFullYear();
			month = dt.getUTCMonth() + 1;
			day = dt.getUTCDate();
			hour = dt.getUTCHours();
			minute = dt.getUTCMinutes();
			second = dt.getUTCSeconds();
			millisecond = dt.getUTCMilliseconds();
		}

		// YYYY-MM-DD HH:mm:ss.mmm
		var str =
				ZynQueryUtils.zeroPad(year, 4) +
				"-" +
				ZynQueryUtils.zeroPad(month, 2) +
				"-" +
				ZynQueryUtils.zeroPad(day, 2) +
				" " +
				ZynQueryUtils.zeroPad(hour, 2) +
				":" +
				ZynQueryUtils.zeroPad(minute, 2) +
				":" +
				ZynQueryUtils.zeroPad(second, 2) +
				"." +
				ZynQueryUtils.zeroPad(millisecond, 3);

		return ZynQueryUtils.escapeString(str);
	}

	public static bufferToString(buffer: any): string {
		return "X" + ZynQueryUtils.escapeString(buffer.toString("hex"));
	}

	public static objectToValues(object: any, timeZone: number) {
		let sql = "";

		for (let key in object) {
			let val = null;
			if (object.hasOwnProperty(key)) {
				val = object[ key ];
			}

			if (typeof val === "function") {
				continue;
			}

			sql +=
				(sql.length === 0 ? "" : ", ") +
				ZynQueryUtils.escapeId(key) +
				" = " +
				ZynQueryUtils.escape(val, true, timeZone);
		}

		return sql;
	}

	public static raw(sql: any) {
		if (typeof sql !== "string") {
			throw new TypeError("argument sql must be a string");
		}

		return {
			toDynUtils: function toDynUtils() {
				return sql;
			},
		};
	}

	public static escapeString(val: any): string {
		if (typeof val !== "string") {
			return val;
		}

		let chunkIndex = (CHARS_GLOBAL_REGEXP.lastIndex = 0);
		let escapedVal = "";
		let match;

		while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
			// @ts-ignore
			escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
			chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
		}

		if (chunkIndex === 0) {
			// Nothing was escaped
			return val;
		}

		if (chunkIndex < val.length) {
			return "'" + escapedVal + val.slice(chunkIndex) + "'";
		}

		return escapedVal;
	}

	public static zeroPad(value: any, length: number): string {
		value = value.toString();

		while (value.length < length) {
			value = "0" + value;
		}

		return value;
	}

	public static convertStrToTimezone(tz: string): number {
		if (tz === "Z") {
			return 0;
		}

		let m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
		if (m) {
			return (m[1] === "-" ? -1 : 1) * (parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) : 0) / 60) * 60;
		}

		return 0;
	}
}
