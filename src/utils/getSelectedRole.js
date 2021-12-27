// @flow

import type { DiscordRole } from '../type/discord-type'
import { getAxios } from './axiosHelper'
import config from '../config'
import languageChoices from './languageChoices'
import discordHeaders from './discordHeaders'

export default async function(guild_id: string, language: string): Promise<DiscordRole> {
  const roles: Array<DiscordRole> = await getAxios(config.discord.api.listRoles(guild_id), {}, discordHeaders)
  const selectedRole: ?DiscordRole = roles.find(role => {
    return role.name === language
  })
  if (!selectedRole) {
    throw new Error(`That role does not exist. ${language}`)
  }
  if (selectedRole.permissions !== '0') {
    throw new Error(`That role has elevated permissions. ${language}. ${JSON.stringify(selectedRole)}`)
  }
  const foundChoice = languageChoices.find(choice => choice.name === selectedRole.name)
  if (!foundChoice) {
    throw new Error(`That role was not one of the choices. ${language}`)
  }
  return selectedRole
}