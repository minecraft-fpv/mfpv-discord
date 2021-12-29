// @flow

import {S3Client} from "@aws-sdk/client-s3";
import config from "../config";

let client

export default function getS3Client(): any {
  // const provider = defaultProvider({
  //   profile: config.aws.profile,
  // })
  if (!client) {
    client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
      }
    })
  }

  return client
}