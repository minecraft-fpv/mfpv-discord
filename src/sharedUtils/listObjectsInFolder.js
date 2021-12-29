// @flow

import getS3Client from "./getS3Client";
import {ListObjectsCommand} from "@aws-sdk/client-s3";
import config from "../config";

export type S3Object = {
  Key: string,
  LastModified: Date,
  ETag: string,
  Size: number,
  StorageClass: string,
  Owner: {
    DisplayName: string,
    ID: string
  }
}

export default async function(folderPrefix: ?string): Promise<Array<S3Object>> {
  console.log('folderPrefix', folderPrefix)
  if (!folderPrefix) return []
  if (folderPrefix.startsWith('/')) {
    folderPrefix = folderPrefix.slice(1)
  }

  const client = getS3Client()

  const items = await client.send(
    new ListObjectsCommand({
      Bucket: config.aws.bucket,
      // ExpectedBucketOwner: (await client.config.credentials()).accessKeyId,
    })
  )
  console.log('items', items)

  const filtered = items?.Contents?.filter(item => item.Key.startsWith(folderPrefix)) ?? []

  return filtered
}