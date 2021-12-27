// @flow

require('dotenv-defaults/config')

const {
  MFPV_DISCORD_APPLICATION_ID,
  MFPV_DISCORD_PUBLIC_KEY,
  MFPV_DISCORD_BOT_TOKEN,
  MFPV_DISCORD_GUILD_ID,
  MFPV_AWS_PROFILE,
  MFPV_AWS_REGION,
  MFPV_AWS_BUCKET,
  MFPV_AWS_ACCESS_KEY_ID,
  MFPV_AWS_SECRET_ACCESS_KEY,
} = process.env

const key = {
  discord: {
    applicationId: MFPV_DISCORD_APPLICATION_ID || '',
    public: MFPV_DISCORD_PUBLIC_KEY || '',
    botToken: MFPV_DISCORD_BOT_TOKEN || '',
    guildId: MFPV_DISCORD_GUILD_ID || ''
  },
}

export default {
  discord: {
    api: {
      createMessage: (channelId: string) => `https://discord.com/api/v8/channels/${channelId}/messages`,
      registerSlashCommand: `https://discord.com/api/v8/applications/${key.discord.applicationId}/commands`,
      deleteCommand: (commandId: string) =>
        `https://discord.com/api/v8/applications/${key.discord.applicationId}/commands/${commandId}`, // DELETE
      listCommands: `https://discord.com/api/v8/applications/${key.discord.applicationId}/commands`,

      listRoles: (guildId: string) => `https://discord.com/api/v8/guilds/${guildId}/roles`,
      modifyRole: (guildId: string, roleId: string) => `https://discord.com/api/v8/guilds/${guildId}/roles/${roleId}`, // PATCH
      giveRole: (guildId: string, userId: string, roleId: string) =>
        `https://discord.com/api/v8/guilds/${guildId}/members/${userId}/roles/${roleId}`, // PUT
      removeRole: (guildId: string, userId: string, roleId: string) => `https://discord.com/api/v8/guilds/${guildId}/members/${userId}/roles/${roleId}`, // DELETE
    },
  },
  key,
  aws: {
    profile: MFPV_AWS_PROFILE,
    region: MFPV_AWS_REGION,
    bucket: MFPV_AWS_BUCKET,
    accessKeyId: MFPV_AWS_ACCESS_KEY_ID,
    secretAccessKey: MFPV_AWS_SECRET_ACCESS_KEY
  }
}
