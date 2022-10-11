/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-11 16:16
 */

export class ZynVarUtils {
	public static isNumeric(value: any): boolean {
		return !isNaN(+value);
	}
}
