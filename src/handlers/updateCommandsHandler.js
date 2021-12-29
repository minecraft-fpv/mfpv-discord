// @flow

import makeApiGatewayResponse from "../sharedUtils/makeApiGatewayResponse"
import registerDownloadCommand from "../commandRegisters/registerDownloadCommand";
import registerRestoreCommand from "../commandRegisters/registerRestoreCommand";

exports.handler = async function(event: any): any {
  try {
    await registerDownloadCommand()
    await registerRestoreCommand()

    return makeApiGatewayResponse(200, 'OK')
  } catch (err) {
    console.error(err)
    return makeApiGatewayResponse(400, err)
  }
}
