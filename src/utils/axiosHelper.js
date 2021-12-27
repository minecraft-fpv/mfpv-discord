// @flow

import axios from 'axios'
import parseAxiosError from './parseAxiosError'
import querystring from 'querystring'

export function getAxios(
  url: string,
  data: { [string]: any },
  headers?: ?{ [string]: string }
) {
  return processAxios(
    url,
    data,
    headers,
    axios.get(`${url}?${querystring.stringify(data)}`, {
      headers,
    })
  )
}

export function postAxios(
  url: string,
  data: { [string]: any },
  headers?: ?{ [string]: string }
) {
  return processAxios(
    url,
    data,
    headers,
    axios.post(url, data, {
      headers,
    })
  )
}

export function putAxios(url: string, data: { [string]: any }, headers?: ?{ [string]: string }) {
  return processAxios(
    url,
    data,
    headers,
    axios.put(url, data, {
      headers,
    })
  )
}

export function patchAxios(url: string, data: { [string]: any }, headers?: ?{ [string]: string }) {
  return processAxios(
    url,
    data,
    headers,
    axios.patch(url, data, {
      headers,
    })
  )
}


export function deleteAxios(url: string, headers?: ?{ [string]: string }) {
  return processAxios(
    url,
    null,
    headers,
    axios.delete(url, {
      headers,
    })
  )
}

async function processAxios(url: any, data: any, headers: any, axiosPromise: Promise<any>) {
  const res = await axiosPromise.catch((err) => {
    const shortResponse = parseAxiosError(err)

    const simpleError = new Error(`url: ${url}.
input: ${JSON.stringify(data)}.
output: ${JSON.stringify(shortResponse)}
`)

    throw simpleError
  })

  console.log(`url: ${url}.
input: ${JSON.stringify(data)}.
output: ${JSON.stringify(res.data)}
`)

  return res.data
}
