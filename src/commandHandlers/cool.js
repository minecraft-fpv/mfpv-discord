// @flow

import { deleteAxios, putAxios } from '../utils/axiosHelper'
import config from '../config'
import discordHeaders from '../utils/discordHeaders'
import getSelectedRole from '../utils/getSelectedRole'
import type {DiscordInteractionRequestBody} from "../type/discord-type";
import nonMaybe from 'non-maybe'
import mysql from "mysql";
import makeQuery from "../sharedUtils/makeQuery";
import sqltag from "sql-template-tag";
import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse.js"

export default async function (body: DiscordInteractionRequestBody, res: any): any {
  const {
    application_id,
    // guild_id,
    channel_id,
    type,
    data,
    member,
    token,
  } = body
  const guild_id = nonMaybe(body.guild_id)

  console.log('data', data)

  if (data?.name !== 'cool' || data?.type !== 1) return

  const userId = nonMaybe(member?.user?.id)
  const username = nonMaybe(member?.user?.username)
  const selectedRole = await getSelectedRole(guild_id, 'cool')

  const hasRoleAlready = member?.roles?.includes(selectedRole.id)

  if (hasRoleAlready) {
    await deleteAxios(
      config.discord.api.removeRole(guild_id, userId, selectedRole.id),
      discordHeaders
    )

    await markUncool(userId)

    return makeApiGatewayResponse(200, {
      type: 4,
      data: {
        content: `${username} has lost their cool. How will they regain it?`,
        // flags: 1 << 6 // Only the user receiving can see.
      },
    })
    // return res.status(200).json({
    //   type: 4,
    //   data: {
    //     content: `${username} has lost their cool. How will they regain it?`,
    //     // flags: 1 << 6 // Only the user receiving can see.
    //   },
    // })
  } else {
    const isUncool = await checkUncool(userId)

    if (isUncool) {
      return makeApiGatewayResponse(200, {
        type: 4,
        data: {
          content: `You lost your cool. How will you regain it?`,
          flags: 1 << 6 // Only the user receiving can see.
        },
      })
      // return res.status(200).json({
      //   type: 4,
      //   data: {
      //     content: `You lost your cool. How will you regain it?`,
      //     flags: 1 << 6 // Only the user receiving can see.
      //   },
      // })
    }

    await putAxios(
      config.discord.api.giveRole(guild_id, userId, selectedRole.id),
      {},
      discordHeaders
    )
    return makeApiGatewayResponse(200, {
      type: 4,
      data: {
        content: `${username} is pretty cool.`,
        // flags: 1 << 6 // Only the user receiving can see.
      },
    })
    // return res.status(200).json({
    //   type: 4,
    //   data: {
    //     content: `${username} is pretty cool.`,
    //     // flags: 1 << 6 // Only the user receiving can see.
    //   },
    // })
  }
}

async function markUncool(userId: string) {
  try {
    const connection = mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.username,
      password: config.db.password,
      database: config.db.database,
      multipleStatements: true
    })
    const query = makeQuery(connection)
    const sql = sqltag`
        INSERT INTO Cool (
          coolId,
          userId,
          isUncool,
          dateUpdated
        ) VALUES (
          UNHEX(REPLACE(UUID(),'-','')),
          ${userId},
          TRUE,
          CURRENT_TIMESTAMP
        ) ON DUPLICATE KEY UPDATE -- userId
          isUncool = TRUE,
          dateUpdated = CURRENT_TIMESTAMP;
      `
    await query(sql)
  } catch (err) {
    console.error(err)
  }
}

async function checkUncool(userId: string) {
  try {
    const connection = mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.username,
      password: config.db.password,
      database: config.db.database,
      multipleStatements: true
    })
    const query = makeQuery(connection)
    const sql = sqltag`
      SELECT * FROM Cool WHERE userId = ${userId};    
    `
    const rows = await query(sql)
    return rows?.[0]
  } catch (err) {
    console.error(err)
  }
}