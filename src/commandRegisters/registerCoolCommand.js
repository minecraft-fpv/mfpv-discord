// @flow

import config from "../config";
import {postAxios} from "../utils/axiosHelper";
import discordHeaders from "../utils/discordHeaders";
import {format} from "date-fns";
import type {DiscordCommandExampleChoice} from "../type/discord-type";
import listObjectsInFolder from "../sharedUtils/listObjectsInFolder";
import {lastModifiedAsc} from "../utils/findChosenSnapshotKey";

export default async function(req: any, res: any): any {
  const coolExample = {
    application_id: config.key.discord.applicationId,
    name: 'cool',
    type: 1,
    description: 'Are you cool?',
    // options: [
    //   // {
    //   //   name: 'date',
    //   //   description: `Which snapshot do you want?`,
    //   //   type: 3,
    //   //   required: true,
    //   //   choices: [
    //   //     {
    //   //       name: 'name',
    //   //       value: 'name'
    //   //     },
    //   //     {
    //   //       name: 'v',
    //   //       value: 'v'
    //   //     }
    //   //   ],
    //   // },
    // ],
  }

  console.log('coolExample', coolExample)

  await createOrUpdateCommand(coolExample)

  console.log('command updated')
}

async function createOrUpdateCommand(example) {
  await postAxios(
    config.discord.api.registerSlashCommand,
    example,
    discordHeaders
  )
}
