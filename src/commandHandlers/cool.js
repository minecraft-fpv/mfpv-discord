// @flow

import { deleteAxios, putAxios } from '../utils/axiosHelper'
import config from '../config'
import discordHeaders from '../utils/discordHeaders'
import getSelectedRole from '../utils/getSelectedRole'
import type {DiscordInteractionRequestBody} from "../type/discord-type";
import nonMaybe from 'non-maybe'

export default async function (req: { body: DiscordInteractionRequestBody }, res: any): any {
  const {
    application_id,
    // guild_id,
    channel_id,
    type,
    data,
    member,
    token,
  } = req.body
  const guild_id = nonMaybe(req.body.guild_id)

  console.log('data', data)

  if (data?.name !== 'cool' || data?.type !== 1) return

  const userId = nonMaybe(member?.user?.id)
  const username = nonMaybe(member?.user?.username)
  const selectedRole = await getSelectedRole(guild_id, 'cool')

  const hasRoleAlready = member?.roles?.includes(selectedRole.id)

  if (hasRoleAlready) {
    await deleteAxios(
      config.discord.api.removeRole(guild_id, userId, selectedRole.id),
      discordHeaders
    )
    return res.status(200).json({
      type: 4,
      data: {
        content: `${username} has lost their cool. Will they regain it?`,
        // flags: 1 << 6 // Only the user receiving can see.
      },
    })
  } else {
    await putAxios(
      config.discord.api.giveRole(guild_id, userId, selectedRole.id),
      {},
      discordHeaders
    )
    return res.status(200).json({
      type: 4,
      data: {
        content: `${username} is pretty cool.`,
        // flags: 1 << 6 // Only the user receiving can see.
      },
    })
  }
}
