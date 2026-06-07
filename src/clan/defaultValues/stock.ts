import { CreateStockDto } from '../../clanInventory/stock/dto/createStock.dto';
import { Environment } from '../../common/enum/environment.enum';

/**
 * Get the default Stock object
 * @param clan_id to which the Stock belongs to
 * @returns
 */
export default function getDefaultStock(
  clan_id: string,
  environment: Environment,
): CreateStockDto {
  return {
    cellCount: 20,
    clan_id,
    environment,
  };
}
