// @flow

import type {DiscordInteractionRequestBody} from "../type/discord-type";
import config from '../config'
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {GetObjectCommand, ListObjectsCommand, S3Client} from "@aws-sdk/client-s3";
import {format, parseISO} from "date-fns";

const EXPIRES_IN_SECONDS = 60 * 5

export default async function (req: { body: DiscordInteractionRequestBody }, res: any) {
  const {
    application_id,
    guild_id,
    channel_id,
    type,
    data,
    member,
    token,
  } = req.body

  console.log('data', data)

  if (data?.name !== 'download' || data?.type !== 1) return

  const month = data?.options?.[0]?.value ?? ''

  const client = getClient()

  const items = await client.send(
    new ListObjectsCommand({
      Bucket: config.aws.bucket,
      // ExpectedBucketOwner: (await client.config.credentials()).accessKeyId,
    })
  )
  console.log('items', items)

  let Key
  if (!month) {
    items?.Contents?.sort(lastModifiedAscComparator)

    Key = items?.Contents?.[items?.Contents?.length - 1]?.Key
  } else {
    Key = items?.Contents?.find(item => format(item.LastModified, 'yyyy/MM/dd') === month)?.Key
  }

  console.log('Key', Key)
  if (!Key) {
    throw new Error('Could not find key.')
  }

  const getCommand = new GetObjectCommand({
    Bucket: config.aws.bucket,
    Key
  })
  const url = await getSignedUrl(client, getCommand, { expiresIn: EXPIRES_IN_SECONDS });

  console.log('url', url)

  return res.status(200).json({
    type: 4,
    data: {
      content: `Your link will expire in ${Math.round(EXPIRES_IN_SECONDS / 60)} minutes.\n${url}`,
      flags: 1 << 6
    },
  })
}

function getClient() {
  // const provider = defaultProvider({
  //   profile: config.aws.profile,
  // })
  const client = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    }
  })
  return client
}

function lastModifiedAscComparator(a, b) {
  const timeA = parseISO(a.LastModified)
  const timeB = parseISO(b.LastModified)

  if (timeA < timeB) {
    return - 1
  }
  if (timeA > timeB) {
    return 1
  }
  return 0
}