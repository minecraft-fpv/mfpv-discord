// @flow

import {postAxios} from "../utils/axiosHelper";
import config from "../config";
import discordHeaders from "../utils/discordHeaders";
import type {DiscordInteractionRequestBody} from "../type/discord-type";

export default async function(interaction: DiscordInteractionRequestBody, content: string) {
  const followupRes = await postAxios(
    config.discord.api.createFollowupMessage(interaction),
    {
      content,
      flags: 1 << 6
    },
    discordHeaders
  )
  console.log('followupRes', followupRes)
}