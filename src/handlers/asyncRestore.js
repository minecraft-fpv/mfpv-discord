// @flow

import {postAxios} from "../utils/axiosHelper"
import config from "../config"
import discordHeaders from "../utils/discordHeaders"
import makeApiGatewayResponse from "../utils/makeApiGatewayResponse"
import type {DiscordInteractionRequestBody} from "../type/discord-type";
import sendDeferredFollowup from "../sharedUtils/sendDeferredFollowup";

exports.handler = async function(req: { body: DiscordInteractionRequestBody }): any {
  console.log('event', req)
  try {
    await (new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 1000)
    }))

    await sendDeferredFollowup(req.body, 'The .zip file has been uploaded.')
    await sendDeferredFollowup(req.body, 'The database has been restored.')

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    return makeApiGatewayResponse(400, err)
  }
}