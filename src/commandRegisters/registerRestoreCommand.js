// @flow

import type {DiscordCommandExampleChoice} from "../type/discord-type";
import config from "../config";
import {postAxios} from "../utils/axiosHelper";
import discordHeaders from "../utils/discordHeaders";
import {ListObjectsCommand, S3Client} from "@aws-sdk/client-s3";
import {format} from "date-fns";
import getS3Client from "../sharedUtils/getS3Client";
import listObjectsInFolder from "../sharedUtils/listObjectsInFolder";

// This file looks similar to registerDownloadCommand because it needs to have the same date options.
export default async function(req: any, res: any): any {
  const items = await listObjectsInFolder(config.aws.folderPrefix.worldSnapshots)
  console.log('items', items)

  const dates: ?Array<DiscordCommandExampleChoice> = items?.map(item => ({
    name: `${format(item.LastModified, 'yyyy/MM/dd')}`,
    value: `${format(item.LastModified, 'yyyy/MM/dd')}`
  }))

  if (!dates?.length) {
    throw new Error('No snapshots found')
  }

  console.log('dates', dates)

  const restoreExample = {
    application_id: config.key.discord.applicationId,
    name: 'restore',
    type: 1,
    description: 'Restore the world using a snapshot.',
    options: [
      {
        name: 'date',
        description: `Which snapshot do you want?`,
        type: 3,
        required: false,
        choices: dates,
      },
    ],
  }

  console.log('restoreExample', restoreExample)

  await createOrUpdateCommand(restoreExample)

  console.log('command updated')
}

async function createOrUpdateCommand(example) {
  await postAxios(
    config.discord.api.registerSlashCommand,
    example,
    discordHeaders
  )
}
