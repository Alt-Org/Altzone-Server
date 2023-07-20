import {IBasicService} from "./IBasicService";
import {IConditionService} from "./IConditionService";
import IDiscriminator from "../../interface/IDiscriminator";

export default interface IBasicAndConditionService<T=object> extends IBasicService<T>, IConditionService<T>, IDiscriminator{
}