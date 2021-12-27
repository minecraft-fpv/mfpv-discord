// @flow

import config from "./config";
import {postAxios} from "./utils/axiosHelper";
import discordHeaders from "./utils/discordHeaders";
import {ListObjectsCommand, S3Client} from "@aws-sdk/client-s3";
import {format} from "date-fns";
import {DiscordCommandExampleChoice} from "./type/discord-type";

export default async function(req, res) {
  const client = getClient()

  const items = await client.send(
    new ListObjectsCommand({
      Bucket: config.aws.bucket,
      // ExpectedBucketOwner: (await client.config.credentials()).accessKeyId,
    })
  )
  console.log('items', items)

  const dates: ?Array<DiscordCommandExampleChoice> = items?.Contents?.map(item => ({
    name: `${format(item.LastModified, 'yyyy/MM')}`,
    value: `${format(item.LastModified, 'yyyy/MM')}`
  }))

  if (!dates?.length) {
    throw new Error('No snapshots found')
  }

  console.log('dates', dates)

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
        choices: dates,
      },
    ],
  }

  console.log('downloadExample', downloadExample)

  await createOrUpdateCommand(downloadExample)

  console.log('command updated')
}

async function createOrUpdateCommand(example) {
  await postAxios(
    config.discord.api.registerSlashCommand,
    example,
    discordHeaders
  )
}

function getClient() {
  // const provider = defaultProvider({
  //   profile: config.aws.profile,
  // })
  const client = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    }
  })
  return client
}