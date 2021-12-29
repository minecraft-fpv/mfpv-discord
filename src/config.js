// @flow

import type {DiscordInteractionRequestBody} from "./type/discord-type";

require('dotenv-defaults/config')

const {
  MFPV_DISCORD_APPLICATION_ID,
  MFPV_DISCORD_PUBLIC_KEY,
  MFPV_DISCORD_BOT_TOKEN,
  MFPV_DISCORD_GUILD_ID,
  MFPV_AWS_PROFILE,
  MFPV_AWS_REGION,
  MFPV_AWS_BUCKET,
  MFPV_AWS_FOLDER_PREFIX_WORLD_SNAPSHOTS,
  MFPV_AWS_FOLDER_PREFIX_DB_RESTORE_SCRIPTS,
  MFPV_AWS_ACCESS_KEY_ID,
  MFPV_AWS_SECRET_ACCESS_KEY,
  MFPV_DISCORD_ROLE_ID_RESTORE_COMMAND,
  MFPV_BACKUP_BASE_URL,
  MFPV_DISCORD_BOT_BASE_URL,
  MFPV_DB_HOST,
  MFPV_DB_PORT,
  MFPV_DB_USER,
  MFPV_DB_PASS,
  MFPV_DB_DATABASE,
  MFPV_JAVA_SERVER_HOST,
  MFPV_JAVA_SERVER_PORT,
  MFPV_JAVA_SERVER_USERNAME,
  MFPV_JAVA_SERVER_PASSWORD,
  MFPV_RESTORE_REDIRECT
} = process.env

const key: {[string]: {[string]: string}} = {
  discord: {
    applicationId: MFPV_DISCORD_APPLICATION_ID || '',
    public: MFPV_DISCORD_PUBLIC_KEY || '',
    botToken: MFPV_DISCORD_BOT_TOKEN || '',
    guildId: MFPV_DISCORD_GUILD_ID || ''
  },
}

export default {
  restoreRedirect: MFPV_RESTORE_REDIRECT,
  mfpv: {
    discordBotBaseUrl: ((MFPV_DISCORD_BOT_BASE_URL || ''): string),
    backupBaseUrl: ((MFPV_BACKUP_BASE_URL || ''): string),
    asyncRestore: '/async_restore',
    asyncDownload: '/async_download',
    backupDataSync: '/backup_data_sync'
  },
  java: {
    host: MFPV_JAVA_SERVER_HOST,
    port: MFPV_JAVA_SERVER_PORT,
    username: MFPV_JAVA_SERVER_USERNAME,
    password: MFPV_JAVA_SERVER_PASSWORD
  },
  db: {
    host: MFPV_DB_HOST,
    port: MFPV_DB_PORT,
    username: MFPV_DB_USER,
    password: MFPV_DB_PASS,
    database: MFPV_DB_DATABASE,
  },
  discord: {
    api: {
      createMessage: (channelId: string): string => `https://discord.com/api/v8/channels/${channelId}/messages`,
      registerSlashCommand: `https://discord.com/api/v8/applications/${key.discord.applicationId}/commands`,
      deleteCommand: (commandId: string): string =>
        `https://discord.com/api/v8/applications/${key.discord.applicationId}/commands/${commandId}`, // DELETE
      listCommands: `https://discord.com/api/v8/applications/${key.discord.applicationId}/commands`,

      listRoles: (guildId: string): string => `https://discord.com/api/v8/guilds/${guildId}/roles`,
      modifyRole: (guildId: string, roleId: string): string => `https://discord.com/api/v8/guilds/${guildId}/roles/${roleId}`, // PATCH
      giveRole: (guildId: string, userId: string, roleId: string): string =>
        `https://discord.com/api/v8/guilds/${guildId}/members/${userId}/roles/${roleId}`, // PUT
      removeRole: (guildId: string, userId: string, roleId: string): string => `https://discord.com/api/v8/guilds/${guildId}/members/${userId}/roles/${roleId}`, // DELETE

      createFollowupMessage: (interaction: DiscordInteractionRequestBody): string => `https://discord.com/api/v8/webhooks/${key.discord.applicationId}/${interaction.token}`
    },
    roleId: {
      restoreCommand: MFPV_DISCORD_ROLE_ID_RESTORE_COMMAND
    }
  },
  key,
  aws: {
    profile: MFPV_AWS_PROFILE,
    region: MFPV_AWS_REGION,
    bucket: MFPV_AWS_BUCKET,
    accessKeyId: MFPV_AWS_ACCESS_KEY_ID,
    secretAccessKey: MFPV_AWS_SECRET_ACCESS_KEY,
    folderPrefix: {
      worldSnapshots: MFPV_AWS_FOLDER_PREFIX_WORLD_SNAPSHOTS,
      dbSnapshots: MFPV_AWS_FOLDER_PREFIX_DB_RESTORE_SCRIPTS
    }
  },
}
