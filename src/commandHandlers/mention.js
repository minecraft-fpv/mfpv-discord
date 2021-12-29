// @flow

import getSelectedRole from '../utils/getSelectedRole'
import { postAxios, putAxios } from '../utils/axiosHelper'
import config from '../config'
import discordHeaders from '../utils/discordHeaders'

export default async function (req: any, res: any): any {
  const {
    application_id,
    guild_id,
    channel_id,
    type,
    data,
    member,
    token,
  } = req.body

  if (data?.name !== 'mention' || data?.type !== 1) return

  const language = data?.options?.[0]?.value ?? ''
  const userId = member?.user?.id
  const selectedRole = await getSelectedRole(guild_id, language)

  const hasRoleAlready = member.roles.includes(selectedRole.id)

  if (!hasRoleAlready) {
    // // add person to role
    // await putAxios(
    //   config.discord.api.giveRole(guild_id, userId, selectedRole.id),
    //   {},
    //   discordHeaders
    // )

    return res.status(200).json({
      type: 4,
      data: {
        content: `❌ You must first join **@${language}** by using **/lang**.`,
        flags: 1 << 6 // Only the user receiving can see.
      },
    })
  }

  return res.status(200).json({
    type: 4,
    data: {
      content: `<@&${selectedRole.id}>`,
    },
  })

  // await postAxios(
  //   config.discord.api.createMessage(channel_id),
  //   {
  //     content: `@gluecode`
  //   },
  //   discordHeaders
  // )
}
