// @flow

import config from '../config'

const headers = {
  "Authorization": `Bot ${config.key.discord.botToken}`
}

export default headers