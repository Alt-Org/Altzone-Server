import {ExternalDocumentationObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

/**
 * Swagger tag name
 */
export type SwaggerTagName =
    'in-development' |
    'Profile' | 'Auth' | 'Player' | 'CustomCharacter' |
    'Clan' | 'SoulHome' | 'Room' | 'Stock' | 'Item' | 'DailyTasks' |
    'Chat' | 'FleaMarket' | 'Voting' | 'Leaderboard' | 'GameAnalytics' | 'Box';

/**
 * All swagger tags and their data
 */
export const swaggerTags: Record<SwaggerTagName, SwaggerTag> = {
    'in-development': {
        name: 'in-development',
        description: 'Endpoint is currently changing or not yet implemented',
    },

    Profile: {
        name: 'Profile',
        description: 'profile',
    },
    Auth: {
        name: 'Auth',
        description: 'Authentication related features',
    },
    Player: {
        name: 'Player',
        description: 'player',
    },
    CustomCharacter: {
        name: 'CustomCharacter',
        description: 'CustomCharacter',
    },

    Clan: {
        name: 'Clan',
        description: 'clan',
    },

    SoulHome: {
        name: 'SoulHome',
        description: 'soulhome',
    },
    Room: {
        name: 'Room',
        description: 'room',
    },
    Stock: {
        name: 'Stock',
        description: 'stock',
    },
    Item: {
        name: 'Item',
        description: 'item',
    },
    DailyTasks: {
        name: 'DailyTasks',
        description: 'In-game tasks for Player to do daily, weekly, monthly',
    },

    Chat: {
        name: 'Chat',
        description: 'chats and their messages ',
    },
    FleaMarket: {
        name: 'FleaMarket',
        description: "Flea market, place where Clans can sell own items or buy other's.",
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
};


/**
 * Swagger tag information
 */
export type SwaggerTag = {
    /**
     * Name of the tag
     */
    name: SwaggerTagName,
    /**
     * Description of the tag
     */
    description: string,

    /**
     * Additional settings
     */
    externalDocs?: ExternalDocumentationObject
}
