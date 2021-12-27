// @flow

import type {DiscordInteractionRequestBody} from "../type/discord-type";
import config from '../config'
import nacl from 'tweetnacl'
import serverless from "serverless-http"
import express from "express"
import { deleteAxios, getAxios, putAxios } from '../utils/axiosHelper'
import type { DiscordRole } from '../type/discord-type'
import lang from '../commands/lang'
import mention from '../commands/mention'
import download from "../commands/download";
import updateDownloadCommandOptions from "../updateDownloadCommandOptions";

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get('/update_commands', async (req, res, next) => {
  try {
    await updateDownloadCommandOptions(req, res)
  } catch (err) {
    console.error(err)
    return res.status(400)
  }
})

app.post("/interactions", async (req: {
  body: DiscordInteractionRequestBody
}, res, next) => {
  try {
    const {
      application_id,
      guild_id,
      channel_id,
      type,
      data,
      member,
      token
    } = req.body

    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + req.rawBody.toString('utf-8')),
      Buffer.from(signature, 'hex'),
      Buffer.from(config.key.discord.public, 'hex')
    );

    if (!isVerified) {
      return res.status(401).end('invalid request signature');
    }

    if (type === 1) {
      return res.status(200).json({
        type: 1
      });
    }

    await lang(req, res)
    await mention(req, res)
    await download(req, res)
  } catch (err) {
    console.error(err)
    return res.status(400)
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
