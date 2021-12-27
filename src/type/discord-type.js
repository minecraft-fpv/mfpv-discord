// @flow

export type DiscordCommand = {
  id: string,
  application_id: string,
  name: string,
  description: string,
  version: string,
  default_permission: boolean,
  type: number,
  options?: Array<any>
}

export type DiscordCommandExampleChoice = {
  "name": string,
  "value": any
}

export type DiscordRole = {
  id: string,
  name: string,
  permissions: string,
  position: number,
  color: number,
  hoist: boolean,
  managed: boolean,
  mentionable: boolean
}

export type DiscordUser = {
  id: string,
  username: string,
  avatar: string,
  discriminator: string,
  public_flags: number
}

export type DiscordGuildMember = {
  roles: Array<string>,
  nick: any,
  avatar: any,
  premium_since: any,
  joined_at: string,
  is_pending: boolean,
  pending: boolean,
  user: DiscordUser,
  mute: boolean,
  deaf: boolean
}

type DiscordCommandOptionType = number
// SUB_COMMAND	1
// SUB_COMMAND_GROUP	2
// STRING	3
// INTEGER	4	Any integer between -2^53 and 2^53
// BOOLEAN	5
// USER	6
// CHANNEL	7	Includes all channel types + categories
// ROLE	8
// MENTIONABLE	9	Includes users and roles
// NUMBER	10

type DiscordDataOption = {
  name: string,
  type: DiscordCommandOptionType,
  value?: string | number,
  options?: Array<DiscordDataOption>,
  focused?: boolean // 	true if this option is the currently focused option for autocomplete
}

type DiscordDataValue = {

}

export type DiscordInteractionType = number
// 1 = PING
// 2 = APPLICATION_COMMAND
// 3 = MESSAGE_COMPONENT
// 4 = APPLICATION_COMMAND_AUTOCOMPLETE

export type DiscordInteractionData = {
  id: string,
  name: string,
  type: DiscordInteractionType,
  resolved?: any,
  options?: Array<DiscordDataOption>,
  custom_id?: string,
  component_type?: number,
  values?: Array<DiscordDataValue>,
  target_id?: string,
}

export type DiscordInteractionRequestBody = {
  id: string,
  application_id: string,
  guild_id?: ?string,
  channel_id?: ?string,
  type: DiscordInteractionType,
  data: DiscordInteractionData,
  member?: ?DiscordGuildMember,
  token: string
}
