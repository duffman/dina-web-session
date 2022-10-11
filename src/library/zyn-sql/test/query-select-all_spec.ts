/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-08 10:59
 */

import { ZynSql }   from "../zyn-sql";
import { VarUtils } from "../var.utils";

const igniter = new ZynSql();

let sql = igniter.selectAll().from("users");

console.log("SQL ::", sql.toSql());






let kalle: any = null;

console.log("IsNull ::", VarUtils.isNull(kalle));
console.log("-");

kalle = "pok";

console.log("IsNull ::", VarUtils.isNull(kalle));
console.log("IsNotNull ::", VarUtils.isNotNull(kalle));
console.log("-");

kalle = null;

console.log("IsNull ::", VarUtils.isNull(kalle));
console.log("IsNotNull ::", VarUtils.isNotNull(kalle));
console.log("-");
kalle = undefined;

console.log("IsNull ::", VarUtils.isNull(kalle));
console.log("IsNotNull ::", VarUtils.isNotNull(kalle));
console.log("-");

