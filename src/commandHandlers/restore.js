// @flow

import type {DiscordInteractionRequestBody} from "../type/discord-type";
import config from "../config";
import {postAxios} from "../utils/axiosHelper";
import discordHeaders from "../utils/discordHeaders";
import {format} from "date-fns";
import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse.js"

/**
 * 1. A list of date options was presented by registerRestoreCommand.js
 * 2. Check that the caller has permission given by env var MFPV_DISCORD_ROLE_ID_RESTORE_COMMAND.
 * 3. We cannot trigger a backup. ApexHosting does not have API access to the server.
 * 4. We cannot stop the server.
 * 5. Use ftp to upload .zip file to java server.
 * 6. Run the db restore script, which will drop existing tables.
 * 7. Via manual process: Log into panel and restore from the backup .zip file and restart the server.
 * */
export default async function (body: DiscordInteractionRequestBody, res: any): any {
  const {
    application_id,
    guild_id,
    channel_id,
    type,
    data,
    member,
    token,
  } = body

  if (data?.name !== 'restore' || data?.type !== 1) return

  console.log('restore')

  const date: string = data?.options?.[0]?.value?.toString() ?? format(Date.now(), 'yyyy/MM/dd')
  console.log('date', date)

  const userId = member?.user?.id
  console.log('userId', userId)

  const hasRole = member?.roles?.includes(config.discord.roleId.restoreCommand) ?? false
  console.log('hasRole', hasRole)
  console.log('member?.roles', member?.roles)

  if (!hasRole) {
    return makeApiGatewayResponse(200, {
      type: 4,
      data: {
        content: `❌ Sorry, you cannot do that.`,
        flags: 1 << 6 // Only the user receiving can see.
      },
    })
    // return res.status(200).json({
    //   type: 4,
    //   data: {
    //     content: `❌ Sorry, you cannot do that.`,
    //     flags: 1 << 6 // Only the user receiving can see.
    //   },
    // })
  }

  // Trigger asyncRestore lambda:
  await postAxios(
    `${config.mfpv.discordBotBaseUrl}${config.mfpv.asyncRestore}`,
    req.body
  )

  return makeApiGatewayResponse(200, {
    type: 4,
    data: {
      content: `The restore has started.\nDate: ${date}`,
      flags: 1 << 6
    },
  })
  // return res.status(200).json({
  //   type: 4,
  //   data: {
  //     content: `The restore has started.\nDate: ${date}`,
  //     flags: 1 << 6
  //   },
  // })
}