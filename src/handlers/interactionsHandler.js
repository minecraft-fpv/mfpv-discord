// @flow

import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse"
import caseless from 'caseless'
import nacl from "tweetnacl"
import config from "../config.js"
import lang from "../commandHandlers/lang.js"
import mention from "../commandHandlers/mention.js"
import cool from "../commandHandlers/cool.js"
import download from "../commandHandlers/download.js"
import restore from "../commandHandlers/restore.js"

exports.handler = async function(event: any): any {
  try {
    console.log("event", event)
    console.log("event.body", event.body)
    const body = JSON.parse(event.body)
    const {
      application_id,
      guild_id,
      channel_id,
      type,
      data,
      member,
      token
    } = body

    const headers = caseless(event.headers)

    // $FlowFixMe
    const signature = headers.get('X-Signature-Ed25519');
    // $FlowFixMe
    const timestamp = headers.get('X-Signature-Timestamp');

    console.log("signature", signature)
    console.log("timestamp", timestamp)

    const isVerified = nacl.sign.detached.verify(
      // $FlowFixMe
      Buffer.from(timestamp + event.body.toString('utf-8')), // event.body is string, not object.
      Buffer.from(signature, 'hex'),
      Buffer.from(config.key.discord.public, 'hex')
    );

    if (!isVerified) {
      return makeApiGatewayResponse(401, 'invalid request signature')
      // return res.status(401).end('invalid request signature');
    }

    if (type === 1) {
      return makeApiGatewayResponse(200, {
        type: 1
      })
      // return res.status(200).json({
      //   type: 1
      // });
    }

    const langRes = await lang(body, null)
    if (langRes) {
      console.log("langRes", langRes)
      return langRes
    }
    const mentionRes = await mention(body, null)
    if (mentionRes) {
      console.log("mentionRes", mentionRes)
      return mentionRes
    }
    const coolRes = await cool(body, null)
    if (coolRes) {
      console.log("coolRes", coolRes)
      return coolRes
    }
    const downloadRes = await download(body, null)
    if (downloadRes) {
      console.log("downloadRes", downloadRes)
      return downloadRes
    }
    const restoreRes = await restore(body, null)
    if (restoreRes) {
      console.log("restoreRes", restoreRes)
      return restoreRes
    }

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    return makeApiGatewayResponse(400, err)
  }
}
