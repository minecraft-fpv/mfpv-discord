// @flow

import makeApiGatewayResponse from "../utils/makeApiGatewayResponse"
import updateDownloadCommandOptions from "../updateDownloadCommandOptions";

exports.handler = async function(event: any): any {
  try {
    await updateDownloadCommandOptions()

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    return makeApiGatewayResponse(400, err)
  }
}
