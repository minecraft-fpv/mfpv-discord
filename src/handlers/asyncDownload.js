// @flow

import {postAxios} from "../utils/axiosHelper"
import config from "../config"
import discordHeaders from "../utils/discordHeaders"
import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse"
import type {DiscordInteractionRequestBody} from "../type/discord-type";
import sendDeferredFollowup from "../utils/sendDeferredFollowup";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import getS3Client from "../sharedUtils/getS3Client";

const EXPIRES_IN_SECONDS = 60 * 5

exports.handler = async function(req: { body: {
    interaction: DiscordInteractionRequestBody,
    key: string
  } }): any {
  console.log('event', req)
  const key = req.body.key
  try {
    const client = getS3Client()

    const getCommand = new GetObjectCommand({
      Bucket: config.aws.bucket,
      Key: key
    })
    const url = await getSignedUrl(client, getCommand, { expiresIn: EXPIRES_IN_SECONDS });

    console.log('url', url)

    const lastSlashIndex = key.lastIndexOf('/')
    const filename = key.slice(lastSlashIndex + 1)

    const message = `\`${filename}\`\n${url}`
    console.log(message)

    await sendDeferredFollowup(req.body.interaction, message)

    console.log('good')

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    return makeApiGatewayResponse(400, err)
  }
}