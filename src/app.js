/* eslint-disable no-bitwise */

import {
  Client, Collection, Events, GatewayIntentBits,
} from 'discord.js';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { DynamoReadQueue } from 'noodle-utils';
import Readable from 'stream';
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  createAudioPlayer,
  NoSubscriberBehavior,
  AudioPlayerStatus,
  createAudioResource,
  getVoiceConnection,
  AudioPlayer,
} from '@discordjs/voice';

import {
  DYNAMO_CREDENTIALS,
  DYNAMO_REGION,
  DYNAMO_TABLE,
  DISCORD_CREDENTIALS,
} from './modules/constants';
import { logger } from './modules/logger';
import * as COMMANDS from './modules/commands';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const READ_QUEUE = new DynamoReadQueue(DYNAMO_CREDENTIALS, DYNAMO_REGION, DYNAMO_TABLE);

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
client.commands = new Collection();

// Register commands with client
Object.keys(COMMANDS).forEach((key) => {
  const command = COMMANDS[key];
  client.commands.set(command.data.name, command);
});

// Event handlers for adding and removing intro music
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.debug(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

// Event handler for a person entering the voice channel
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const userHasEnteredChannel = oldState.channel === null && newState.channel !== null;

  if (!userHasEnteredChannel) {
    logger.debug('A user has not entered the channel, doing nothing');
    return;
  }

  const guildId = newState.guild.id;
  const userId = newState.member.id;
  const connection = getVoiceConnection(guildId);

  if (connection) {
    logger.debug('Doing nothing because an intro is already playing');
    return;
  }

  await handleUserJoiningVoiceChannel(guildId, userId, newState.channel);
});

/**
 * Orchestrates fetching the user's video, and playing it in Discord
 *
 * @param {string} guildId The server ID
 * @param {string} userId The user ID for the user who joined a voice channel
 * @param {object} channel The channel that the user joined
 */
async function handleUserJoiningVoiceChannel(guildId, userId, channel) {
  logger.debug('A user has entered the channel...');

  /**
   * Handles the database response by loading a video and playing it over Discord
   *
   * @param {object} result The DynamoDB read result
   */
  const callback = async (result) => {
    if (result.length !== 1) return;

    const { link, start, runtime } = result[0];

    const player = setupPlayer(guildId, channel, runtime);

    logger.debug('Setting up ytdl stream...');
    const rawStream = ytdl(link, {
      filter: 'audioonly',
      quality: 'lowestaudio',
      highWaterMark: 1 << 25,
    });

    logger.debug('Creating ffmpeg stream...');
    createFfmpegStream(rawStream, start).then((playableStream) => {
      logger.debug('Creating audio resource...');
      const playerResource = createAudioResource(playableStream);

      logger.debug('Directing player to play resource...');
      player.play(playerResource);
    });
  };

  const expression = 'userId = :userId';
  const expressionData = {
    ':userId': userId,
  };

  READ_QUEUE.push(
    {
      expression,
      expressionData,
    },
    callback,
  );
}

/**
 * Check if the user's stream is playable
 *
 * @param {Readable} stream The stream created from ytdl download
 * @param {number} startTimestamp Where to begin the stream
 * @returns {Promise.<stream>} The stream to play
 */
async function createFfmpegStream(stream, startTimestamp) {
  return new Promise((resolve, reject) => {
    const download = ffmpeg(stream)
      .audioBitrate(48)
      .format('mp3')
      .noVideo()
      .seekInput(startTimestamp);

    const verifiedDownload = download
      .on('error', (downloadError) => {
        logger.error('Had an issue with this video', downloadError);
        reject();
      })
      .on('codecData', () => {
        logger.debug('Received codec data');
        resolve(verifiedDownload);
      })
      .pipe();
  });
}

/**
 * Creates a player object
 *
 * @param {string} guildId The server ID
 * @param {object} channel The channel that the user joined
 * @param {number} runtime How long the video should run for
 * @returns {AudioPlayer} An audio player
 */
function setupPlayer(guildId, channel, runtime) {
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  player.on(AudioPlayerStatus.Idle, () => {
    logger.debug('Destroying the connection because the player has finished playing');
    getVoiceConnection(guildId).destroy();
    player.stop();
  });

  player.on(AudioPlayerStatus.Playing, () => {
    logger.debug('Joining discord channel...');
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, async () => {
      logger.debug('Connection is ready to play video');
      connection.subscribe(player);

      setTimeout(async () => {
        // the connection may already be cleaned up because the video ended
        // before the timeout triggered
        const maybeConnection = getVoiceConnection(guildId);
        if (maybeConnection) {
          logger.debug('Destroying the connection based on the timeout');
          maybeConnection.destroy();
          player.stop();
        }
      }, runtime * 1000);
    });
  });

  return player;
}

// Log in to Discord
client.login(DISCORD_CREDENTIALS.token);
