// @flow

import type {DiscordInteractionRequestBody} from "../type/discord-type";
import config from '../config'
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {GetObjectCommand, ListObjectsCommand, S3Client} from "@aws-sdk/client-s3";
import {format, parseISO} from "date-fns";
import getS3Client from "../sharedUtils/getS3Client";
import {postAxios} from "../utils/axiosHelper";
import findChosenSnapshotKey from "../utils/findChosenSnapshotKey";
import listObjectsInFolder from "../sharedUtils/listObjectsInFolder";



export default async function (req: { body: DiscordInteractionRequestBody }, res: any): any {
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

  const date: string = data?.options?.[0]?.value?.toString() ?? format(Date.now(), 'yyyy/MM/dd')
  console.log('date', date)

  const items = await listObjectsInFolder(config.aws.folderPrefix.worldSnapshots)
  console.log('items', items)

  const Key = findChosenSnapshotKey(date, items)
  if (!Key) {
    throw new Error('Could not find key.')
  }

  // Trigger asyncDownload lambda:
  await postAxios(
    `${config.mfpv.discordBotBaseUrl}${config.mfpv.asyncDownload}`,
    { // asyncDownload will receive this payload:
      interaction: req.body,
      key: Key
    }
  )

  return res.status(200).json({
    type: 4,
    data: {
      content: 'A link has been generated.'
      // content: `Your link will expire in ${Math.round(EXPIRES_IN_SECONDS / 60)} minutes.\n${url}`,
      // flags: 1 << 6
    },
  })
}
