/** @memberof data-structures */

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
   * @param {object} newState The new state of a player
   */
  updateState(guildId, newState) {
    this.players[guildId] = newState;
  }

  /**
   * Method to fetch the state of a given player
   *
   * @param {string} guildId The ID of the guild we want the player from
   * @returns {object} The state of the player associated with the guild ID
   */
  getPlayerState(guildId) {
    return this.players[guildId];
  }
}

const playerManager = new PlayerManager();

export default playerManager;
