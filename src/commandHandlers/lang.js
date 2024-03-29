// @flow

import { deleteAxios, putAxios } from '../utils/axiosHelper'
import config from '../config'
import discordHeaders from '../utils/discordHeaders'
import getSelectedRole from '../utils/getSelectedRole'
import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse.js"
import type { DiscordInteractionRequestBody } from "../type/discord-type.js"

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

  console.log('data', data)

  if (data?.name !== 'lang' || data?.type !== 1) return

  const language = data?.options?.[0]?.value ?? ''
  const userId = member?.user?.id
  const selectedRole = await getSelectedRole(guild_id, language)

  const hasRoleAlready = member.roles.includes(selectedRole.id)

  if (hasRoleAlready) {
    await deleteAxios(
      config.discord.api.removeRole(guild_id, userId, selectedRole.id),
      discordHeaders
    )
    return makeApiGatewayResponse(200, {
      type: 4,
      data: {
        content: `You have been removed from **@${language}**.`,
        flags: 1 << 6 // Only the user receiving can see.
      },
    })
    // return res.status(200).json({
    //   type: 4,
    //   data: {
    //     content: `You have been removed from **@${language}**.`,
    //     flags: 1 << 6 // Only the user receiving can see.
    //   },
    // })
  } else {
    await putAxios(
      config.discord.api.giveRole(guild_id, userId, selectedRole.id),
      {},
      discordHeaders
    )
    return makeApiGatewayResponse(200, {
      type: 4,
      data: {
        content: `You have been added to **@${language}**.`,
        flags: 1 << 6 // Only the user receiving can see.
      },
    })
    // return res.status(200).json({
    //   type: 4,
    //   data: {
    //     content: `You have been added to **@${language}**.`,
    //     flags: 1 << 6 // Only the user receiving can see.
    //   },
    // })
  }
}
