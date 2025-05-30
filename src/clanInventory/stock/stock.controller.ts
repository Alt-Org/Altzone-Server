import { Controller, Get, Param } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockDto } from './dto/stock.dto';
import { publicReferences } from './stock.schema';
import { Authorize } from '../../authorization/decorator/Authorize';
import { Action } from '../../authorization/enum/action.enum';
import { GetAllQuery } from '../../common/decorator/param/GetAllQuery';
import { IncludeQuery } from '../../common/decorator/param/IncludeQuery.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { _idDto } from '../../common/dto/_id.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { AddSearchQuery } from '../../common/interceptor/request/addSearchQuery.interceptor';
import { AddSortQuery } from '../../common/interceptor/request/addSortQuery.interceptor';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';
import { IGetAllQuery } from '../../common/interface/IGetAllQuery';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@Controller('stock')
export class StockController {
  public constructor(private readonly service: StockService) {}

  /**
   * Get stock by _id
   *
   * @remarks Read Stock data by its _id field.
   *
   * Notice that everybody is able to read any Stock data.
   */
  @ApiResponseDescription({
    success: {
      dto: StockDto,
      modelName: ModelName.STOCK,
    },
    errors: [400, 401, 404],
  })
  @Get('/:_id')
  @Authorize({ action: Action.read, subject: StockDto })
  @UniformResponse(ModelName.STOCK)
  public get(
    @Param() param: _idDto,
    @IncludeQuery(publicReferences) includeRefs: ModelName[],
  ) {
    return this.service.readOneById(param._id, { includeRefs });
  }

  /**
   * Get all stocks
   *
   * @remarks Read all created Stocks of all Clans. Remember about the pagination
   */
  @ApiResponseDescription({
    success: {
      dto: StockDto,
      modelName: ModelName.STOCK,
      returnsArray: true,
    },
    errors: [401, 404],
  })
  @Get()
  @Authorize({ action: Action.read, subject: StockDto })
  @OffsetPaginate(ModelName.STOCK)
  @AddSearchQuery(StockDto)
  @AddSortQuery(StockDto)
  @UniformResponse(ModelName.STOCK)
  public getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.readAll(query);
  }
}
