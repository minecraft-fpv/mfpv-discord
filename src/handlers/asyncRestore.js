// @flow

import type {DiscordInteractionRequestBody} from "../type/discord-type";
import config from "../config"
import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse"
import sendDeferredFollowup from "../utils/sendDeferredFollowup";
import listObjectsInFolder from "../sharedUtils/listObjectsInFolder";
import findChosenSnapshotKey from "../utils/findChosenSnapshotKey";
import {format, parseISO} from "date-fns";
import getS3Client from "../sharedUtils/getS3Client";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import mysql from 'mysql'
import makeQuery from "../sharedUtils/makeQuery";
import {postAxios} from "../utils/axiosHelper";
const FTP = require("basic-ftp")

/*
* See restore.js for details.
* */
exports.handler = async function(req: { body: DiscordInteractionRequestBody }): any {
  console.log('event', req)
  try {
    const date = req.body.data?.options?.[0]?.value?.toString() ?? format(Date.now(), 'yyyy/MM/dd')
    console.log('date', date)

    const worldSnapshots = await listObjectsInFolder(config.aws.folderPrefix.worldSnapshots)
    console.log('worldSnapshots', worldSnapshots)

    const dbSnapshots = await listObjectsInFolder(config.aws.folderPrefix.dbSnapshots)
    console.log('dbSnapshots', dbSnapshots)

    const worldSnapshotKey = findChosenSnapshotKey(date, worldSnapshots)
    const dbSnapshotKey = findChosenSnapshotKey(date, dbSnapshots)

    if (worldSnapshotKey && !dbSnapshotKey) {
      throw new Error(`World snapshot was found, but not a DB snapshot.\nDate: ${date}`)
    }
    if (dbSnapshotKey && !worldSnapshotKey) {
      throw new Error(`DB snapshot was found, but not a world snapshot.\nDate: ${date}`)
    }
    if (!worldSnapshotKey || !dbSnapshotKey) {
      throw new Error(`Neither world nor DB snapshot found.\nDate: ${date}`)
    }

    const client = getS3Client()

    const worldSnapshot = await client.send(new GetObjectCommand({
      Bucket: config.aws.bucket,
      Key: worldSnapshotKey
    }))
    console.log('worldSnapshot', worldSnapshot)

    const dbSnapshot = await client.send(new GetObjectCommand({
      Bucket: config.aws.bucket,
      Key: dbSnapshotKey
    }))
    console.log('dbSnapshot', dbSnapshot)

    await restoreWorld(req.body, worldSnapshot.Body, worldSnapshotKey)

    await restoreDB(req.body, dbSnapshot.Body)

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    await sendDeferredFollowup(req.body, err.message)
    return makeApiGatewayResponse(400, err)
  }
}

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

async function restoreWorld(interaction: DiscordInteractionRequestBody, worldSnapshotStream: any, worldSnapshotKey: string) {
  const lastSlashIndex = worldSnapshotKey.lastIndexOf('/')
  const filename = worldSnapshotKey.slice(lastSlashIndex + 1)
  const basename = filename.slice(0, filename.lastIndexOf('_'))
  const timestamp = filename.slice(filename.lastIndexOf('_') + 1, -4)
  const seconds = Math.round(parseISO(timestamp).valueOf() / 1000)
  const remoteFilename = `${basename}.${seconds}.zip`

  const client = new FTP.Client(0)

  await client.access({
    host: config.java.host,
    port: config.java.port,
    user: config.java.username,
    password: config.java.password,
    secure: false,
  })

  console.log('timestamp', timestamp)
  console.log('remoteFilename', remoteFilename)
  await client.uploadFrom(worldSnapshotStream, remoteFilename)

  await sendDeferredFollowup(interaction, `\`${remoteFilename}\` file has been uploaded.\n${config.restoreRedirect || ''}`)
}

async function restoreDB(interaction: DiscordInteractionRequestBody, dbSnapshotStream: any) {
  console.log('backing up DB')
  // Trigger backupData lambda:
  await postAxios(
    `${config.mfpv.backupBaseUrl}${config.mfpv.backupDataSync}`,
    {
      unscheduled: true // See backupData.js
    }
  )

  console.log('unscheduled DB backup complete')

  const restoreScript = await streamToString(dbSnapshotStream)

  console.log('restoreScript', restoreScript)

  console.log('config.db.host', config.db.host)
  console.log('config.db.database', config.db.database)

  const connection = mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true
  })

  const query = makeQuery(connection)

  await query(restoreScript)

  await sendDeferredFollowup(interaction, 'The database has been restored.')
}
