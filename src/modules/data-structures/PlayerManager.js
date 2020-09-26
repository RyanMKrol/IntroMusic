/**
 * A class to manage the state of all players run by this service
 */
class PlayerManager {
  /**
   * Constructs the object
   */
  constructor() {
    this.players = {};
  }

  /**
   * Method to update the state of a given player
   *
   * @param {string} guildId The ID of the guild that this player belongs to
   * @param {boolean} isPlaying Whether the player is playing or not
   */
  setIsPlayerPlaying(guildId, isPlaying) {
    this.players[guildId] = isPlaying;
  }

  /**
   * Method to fetch the state of a given player
   *
   * @param {string} guildId The ID of the guild we want the player from
   * @returns {boolean} Whether the player is playing or not
   */
  getIsPlayerPlaying(guildId) {
    return this.players[guildId] || false;
  }
}

const playerManager = new PlayerManager();

export default playerManager;
