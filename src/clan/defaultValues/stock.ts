import { CreateStockDto } from "../../stock/dto/createStock.dto"

/**
 * Get the default Stock object
 * @param clan_id to which the Stock belongs to
 * @returns 
 */
export default function getDefaultStock(clan_id: string): CreateStockDto {
    return {
        type: 1,
        rowCount: 5,
        columnCount: 5,
        clan_id
    }
}