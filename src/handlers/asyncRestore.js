// @flow

import type {DiscordInteractionRequestBody} from "../type/discord-type";
import config from "../config"
import makeApiGatewayResponse from "../utils/makeApiGatewayResponse"
import sendDeferredFollowup from "../utils/sendDeferredFollowup";
import listObjectsInFolder from "../sharedUtils/listObjectsInFolder";
import findChosenSnapshotKey from "../utils/findChosenSnapshotKey";
import {format} from "date-fns";

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
    if (!worldSnapshotKey && !dbSnapshotKey) {
      throw new Error(`Neither world nor DB snapshot found.\nDate: ${date}`)
    }

    // chosen
    //
    //
    // await client.send(new GetObjectCommand({
    //   Bucket: config.aws.bucket,
    //   Key
    // }))


    await sendDeferredFollowup(req.body, 'The .zip file has been uploaded.')
    await sendDeferredFollowup(req.body, 'The database has been restored.')

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    await sendDeferredFollowup(req.body, err.message)
    return makeApiGatewayResponse(400, err)
  }
}