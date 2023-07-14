import {IBasicService} from "./IBasicService";
import {IConditionService} from "./IConditionService";
import IDiscriminator from "../../interface/IDiscriminator";

export default interface IBasicAndConditionService extends IBasicService, IConditionService, IDiscriminator{
}