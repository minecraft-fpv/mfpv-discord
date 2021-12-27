// @flow

export default function(
  error: any
): {
  status: number,
  statusText: string,
  data: any,
} {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const response = error.response || {}
    const shortResponse = {
      status: response.status,
      statusText: response.statusText,
      data: Buffer.isBuffer(response.data) ? { type: 'Buffer' } : response.data,
    }
    return shortResponse
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    return {
      status: 0,
      statusText: 'No Response',
      data: '',
    }
  } else {
    // Something happened in setting up the request that triggered an Error
    // console.log('Error', error.message);
    return {
      status: 0,
      statusText: 'No Request',
      data: error.message,
    }
  }
}
