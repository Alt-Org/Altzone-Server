import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Swagger tag name
 */
export type SwaggerTagName =
  | 'Release on 27.07.2025'
  | 'Profile'
  | 'Auth'
  | 'Player'
  | 'CustomCharacter'
  | 'Clan'
  | 'SoulHome'
  | 'Room'
  | 'Stock'
  | 'Stall'
  | 'Item'
  | 'DailyTasks'
  | 'FleaMarket'
  | 'ClanShop'
  | 'Shop'
  | 'Chat'
  | 'Voting'
  | 'Leaderboard'
  | 'GameAnalytics'
  | 'Box'
  | 'OnlinePlayers'
  | 'GameData'
  | 'Metadata'
  | 'Feedback';

/**
 * All swagger tags and their data
 *
 */
export const swaggerTags: Record<SwaggerTagName, SwaggerTag> = {
  'Release on 27.07.2025': {
    name: 'Release on 27.07.2025',
    description: 'Changes made on release 27.07.2025',
  },

  Profile: {
    name: 'Profile',
    description: 'profile related functionality',
  },
  Auth: {
    name: 'Auth',
    description: 'Authentication related features',
  },
  Player: {
    name: 'Player',
    description: 'player related functionality',
  },
  CustomCharacter: {
    name: 'CustomCharacter',
    description: 'CustomCharacter related functionality',
  },

  Clan: {
    name: 'Clan',
    description: 'clan related functionality',
  },

  SoulHome: {
    name: 'SoulHome',
    description: 'soulhome related functionality',
  },
  Room: {
    name: 'Room',
    description: 'room related functionality',
  },
  Stock: {
    name: 'Stock',
    description: 'stock related functionality',
  },
  Stall: {
    name: 'Stall',
    description: 'Flea market related functionality',
  },
  Item: {
    name: 'Item',
    description: 'item related functionality',
  },
  DailyTasks: {
    name: 'DailyTasks',
    description: 'In-game tasks for Player to do daily, weekly, monthly',
  },

  FleaMarket: {
    name: 'FleaMarket',
    description:
      "Flea market, place where Clans can sell own items or buy other's.",
  },
  ClanShop: {
    name: 'ClanShop',
    description:
      'Clan shop, place where clans can buy items to decorate their soul homes',
  },
  Shop: {
    name: 'Shop',
    description: 'Shop, place where in-game items can be done with real money',
  },

  Chat: {
    name: 'Chat',
    description: 'chats and their messages ',
  },
  Voting: {
    name: 'Voting',
    description: 'In-game votings',
  },
  Leaderboard: {
    name: 'Leaderboard',
    description: 'Leaderboards of different categories',
  },
  GameAnalytics: {
    name: 'GameAnalytics',
    description: 'Various functionality for game analytics',
  },
  Box: {
    name: 'Box',
    description: 'Testing box data',
  },

  OnlinePlayers: {
    name: 'OnlinePlayers',
    description: 'Information about online players',
  },

  GameData: {
    name: 'GameData',
    description: 'Information about game',
  },

  Metadata: {
    name: 'Metadata',
    description: 'Metadata',
  },
  Feedback: {
    name: 'Feedback',
    description: 'Players feedback about the game',
  },
};

/**
 * Swagger tag information
 */
export type SwaggerTag = {
  /**
   * Name of the tag to display in swagger
   */
  name: SwaggerTagName;
  /**
   * Description of the tag to display in swagger
   */
  description: string;

  /**
   * Additional settings
   */
  externalDocs?: ExternalDocumentationObject;
};
