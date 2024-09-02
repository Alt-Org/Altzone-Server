import {CreateItemDto} from "../../../item/dto/createItem.dto";
import { Recycling } from "../../../item/enum/recycling.enum";

/**
 * Returns default Item objects for a Stock
 *
 * @param stock_id Stock _id to which the returning Items belongs to
 * @returns An array of default Items for a Stock
 */
export function getStockDefaultItems(stock_id: string): CreateItemDto[]{
    return [
        { 
            stock_id, unityKey: 'kirja', name: 'kirja', 
            recycling: Recycling.common, weight: 1, isFurniture: false, price: 1, 
            location : [1,1], room_id: null
        },
        { 
            stock_id, unityKey: 'tyyny', name: 'tyyny', 
            recycling: Recycling.common, weight: 1, isFurniture: false, price: 1, 
            location : [1,2], room_id: null
        },
        { 
            stock_id, unityKey: 'lelu', name: 'lelu', 
            recycling: Recycling.common, weight: 1, isFurniture: false, price: 1, 
            location : [1,3], room_id: null
        }
    ];
}

/**
 * Returns default Item objects for a SoulHome's Room
 *
 * @param room_id Room _id to which the returning Items belongs to
 * @returns An array of default Items for a Room
 */
export function getRoomDefaultItems(room_id: string): CreateItemDto[]{
    return [
        { 
            room_id, unityKey: 'patja', name: 'patja', 
            recycling: Recycling.common, weight: 1, isFurniture: true, price: 1, 
            location : [1,1], stock_id: null
        },
        { 
            room_id, unityKey: 'viltti', name: 'viltti', 
            recycling: Recycling.common, weight: 1, isFurniture: false, price: 1, 
            location : [1,2], stock_id: null
        },
        { 
            room_id, unityKey: 'tuoli', name: 'tuoli', 
            recycling: Recycling.common, weight: 1, isFurniture: true, price: 1, 
            location : [1,3], stock_id: null
        },
        { 
            room_id, unityKey: 'pöytä', name: 'pöytä', 
            recycling: Recycling.common, weight: 1, isFurniture: true, price: 1, 
            location : [1,4], stock_id: null
        },
        { 
            room_id, unityKey: 'lamppu', name: 'lamppu', 
            recycling: Recycling.common, weight: 1, isFurniture: true, price: 1, 
            location : [1,5], stock_id: null
        }
    ];
}