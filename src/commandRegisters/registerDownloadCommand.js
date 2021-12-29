// @flow

import config from "../config";
import {postAxios} from "../utils/axiosHelper";
import discordHeaders from "../utils/discordHeaders";
import {format} from "date-fns";
import type {DiscordCommandExampleChoice} from "../type/discord-type";
import listObjectsInFolder from "../sharedUtils/listObjectsInFolder";

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

  const downloadExample = {
    application_id: config.key.discord.applicationId,
    name: 'download',
    type: 1,
    description: 'Download a world snapshot. We store one snapshot per month and the last seven days.',
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

  console.log('downloadExample', downloadExample)

  await createOrUpdateCommand(downloadExample)

  console.log('command updated')
}

async function createOrUpdateCommand(example) {
  await postAxios(
    config.discord.api.registerSlashCommand,
    example,
    discordHeaders
  )
}
