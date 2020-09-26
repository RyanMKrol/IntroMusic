// credential constants
import DISCORD_CREDENTIALS from '../../../credentials/discord.json';
import DYNAMO_CREDENTIALS from '../../../credentials/dynamo.json';

// command constants
const COMMAND_PREFIX = '!im';
const COMMAND_ADD = 'add';
const COMMAND_REMOVE = 'remove';

const DYNAMO_REGION = 'us-east-2';
const DYNAMO_TABLE = 'IntroMusic';

// player constants
const MAX_PLAY_TIME = 12000;

export {
  DISCORD_CREDENTIALS,
  DYNAMO_CREDENTIALS,
  COMMAND_PREFIX,
  COMMAND_ADD,
  COMMAND_REMOVE,
  DYNAMO_REGION,
  DYNAMO_TABLE,
  MAX_PLAY_TIME,
};
