// @flow

import {format, subDays} from "date-fns";
import type {S3Object} from "../sharedUtils/listObjectsInFolder";

export default function findChosenSnapshotKey(date: string, items: Array<S3Object>): ?string {
  if (!date) {
    date = format(Date.now(), 'yyyy/MM/dd')
  }
  console.log('date', date)

  let key = items.find(item => format(item.LastModified, 'yyyy/MM/dd') === date)?.Key
  console.log('key', key)

  if (!key) {
    // try once more except with yesterday's date.
    date = format(subDays(Date.now(), 1), 'yyyy/MM/dd')
  }
  key = items.find(item => format(item.LastModified, 'yyyy/MM/dd') === date)?.Key
  console.log('key', key)

  // let Key
  // if (!date) {
  //   items.sort(lastModifiedAscComparator)
  //
  //   Key = items[items.length - 1]?.Key
  // } else {
  //   Key = items.find(item => format(item.LastModified, 'yyyy/MM/dd') === date)?.Key
  // }
  // console.log('findChosenSnapshotKey', Key)
  return key
}

export function lastModifiedAsc(a: S3Object, b: S3Object): number {
  const timeA = a.LastModified
  const timeB = b.LastModified

  if (timeA < timeB) {
    return - 1
  }
  if (timeA > timeB) {
    return 1
  }
  return 0
}