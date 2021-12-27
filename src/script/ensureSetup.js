// @flow

import config from '../config'
import {
  deleteAxios,
  getAxios,
  patchAxios,
  postAxios,
} from '../utils/axiosHelper'
import type { DiscordCommand } from '../type/discord-type'
import languageChoices from '../utils/languageChoices'
import discordHeaders from '../utils/discordHeaders'

const languageNames = languageChoices.map((choice) => choice.name)

const setRoleExample = {
  application_id: config.key.discord.applicationId,
  name: 'lang',
  type: 1,
  description: 'You can /mention other people speaking your language.',
  options: [
    {
      name: 'language',
      description: 'The language group you want to join.',
      type: 3,
      required: true,
      choices: languageChoices,
    },
  ],
}

const mentionExample = {
  application_id: config.key.discord.applicationId,
  name: 'mention',
  type: 1,
  description: 'Sends a notification to everyone in a language group.',
  options: [
    {
      name: 'language',
      description: 'The language group you want to mention.',
      type: 3,
      required: true,
      choices: languageChoices,
    },
  ],
}

const downloadExample = {
  application_id: config.key.discord.applicationId,
  name: 'download',
  type: 1,
  description: 'Download a world backup. We store one backup per month.',
  options: [
    {
      name: 'month',
      description: `Which month's backup do you want?`,
      type: 3,
      required: false,
      choices: ['latest', ],
    },
  ],
}

async function deleteCommands() {
  const list: Array<DiscordCommand> = await getAxios(
    config.discord.api.listCommands,
    {},
    discordHeaders
  )

  const deletions = []
  for (const command of list) {
    if (
      command.name !== setRoleExample.name &&
      command.name !== mentionExample.name
    ) {
      deletions.push(command)
    }
  }

  for (const command of deletions) {
    await deleteAxios(
      config.discord.api.deleteCommand(command.id),
      discordHeaders
    )
  }
}

async function createCommands() {
  await postAxios(
    config.discord.api.registerSlashCommand,
    setRoleExample,
    discordHeaders
  )
  await postAxios(
    config.discord.api.registerSlashCommand,
    mentionExample,
    discordHeaders
  )
}

async function listCommands() {
  const list: Array<DiscordCommand> = await getAxios(
    config.discord.api.listCommands,
    {},
    discordHeaders
  )
  console.log('list', list)
}

async function ensureRolesMentionable() {
  const roles = await getAxios(
    config.discord.api.listRoles(config.key.discord.guildId),
    {},
    discordHeaders
  )

  const languageRoles = roles.filter((role) =>
    languageNames.includes(role.name)
  )
  console.log('languageRoles', languageRoles)
  for (const role of languageRoles) {
    await patchAxios(
      config.discord.api.modifyRole(config.key.discord.guildId, role.id),
      {
        name: role.name,
        permissions: role.permissions,
        color: role.color,
        hoist: role.hoist,
        mentionable: true
      },
      discordHeaders
    )
  }
}

Promise.resolve()
  .then(async () => {
    await deleteCommands()
    await createCommands()
    await listCommands()

    await ensureRolesMentionable()
  })
  .catch((err) => {
    console.error(err)
  })
