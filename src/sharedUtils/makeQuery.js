// @flow

import mysql from "mysql";

export default function makeQuery(connection: any): (sql: any) => Promise<any> {
  return async (sql) => {

    if (typeof sql !== 'string') {
      sql = flattenSqlTag(sql)
    }

    return new Promise((resolve, reject) => {
      connection.query(sql, (err, results, fields) => {
        console.log('sql', sql)
        if (err) {
          return reject(err)
        }
        return resolve(results)
      })
    })
  }
}

export function flattenSqlTag(sql: any): string {
  sql = mysql.format(sql.sql, sql.values)
  return sql
}