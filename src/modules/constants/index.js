// credential constants
import DISCORD_CREDENTIALS from '../../../credentials/discord.json';
import DYNAMO_CREDENTIALS from '../../../credentials/dynamo.json';

// command constants
const COMMAND_PREFIX = '!im';

const DYNAMO_REGION = 'us-east-2';
const DYNAMO_TABLE = 'IntroMusic';

// player constants
const MAX_PLAY_TIME_S = 10;

export {
  DISCORD_CREDENTIALS,
  DYNAMO_CREDENTIALS,
  COMMAND_PREFIX,
  DYNAMO_REGION,
  DYNAMO_TABLE,
  MAX_PLAY_TIME_S,
};
