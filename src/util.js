// @flow

import { snowflakeGenerator } from 'snowflake-id-js'
const generator = snowflakeGenerator(512);

export function getSnowflake(): string {
  return generator.next().value.toString()
}