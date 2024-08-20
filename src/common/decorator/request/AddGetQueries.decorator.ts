import {Discriminator} from "../../enum/discriminator.enum";
import { ModelName } from "../../../common/enum/modelName.enum";

/**
 * Add "with" and "all" queries to the endpoint.
 *
 * This basically means, that if these queries are specified, the decorator will add "mongoPopulate"-field to a request object
 *
 * Notice that for this decorator to work the second argument of the controller method must be the request object
 * @returns 
 */
export const AddGetQueries = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
      const originalMethod = descriptor.value;
      descriptor.value = function (this: any, ...args: any[]) {
          validateController(this);
          if(!areArgsValid(args))
              throw new Error(`The ${AddGetQueries.name} decorator needs Request object as the second argument of the method`);

          const request = args[1];
          const {query} = request;
          if(!query)
              return originalMethod.apply(this, args);

          const withQuery = query['with'];
          const allQuery = query['all'];
          if(!withQuery && !(allQuery || allQuery === ''))
              return originalMethod.apply(this, args);

          //all query suppose to be without value
          if(allQuery === '' || allQuery){
              request['mongoPopulate'] = this.service.refsInModel;
              return originalMethod.apply(this, args);
          }

          if(withQuery){
              const withRefs: ModelName[] = withQuery.split('_') as ModelName[];

              if(withRefs.length === 0)
                  return originalMethod.apply(this, args);

              request['mongoPopulate'] = [];

              for(let i=0; i<withRefs.length; i++){
                  const refModelName = withRefs[i];

                  if(this.service.refsInModel.includes(refModelName))
                      request['mongoPopulate'].push(refModelName);
              }

              return originalMethod.apply(this, args);
          }

          return originalMethod.apply(this, args);
      }
      return descriptor;
  }
}

function validateController(controller: any) {
    if(!controller)
        throw new Error('"this" is undefined. Please check that it is accessible in the context');

    if(
        !controller.service || 
        !controller.service.discriminators ||
        !(
            controller.service.discriminators.includes(Discriminator.IBasicService) ||
            controller.service.discriminators.includes(Discriminator.IConditionService)
        )  
    )
        throw new Error('Field "service" (type IBasicService or IConditionService) is not defined in the controller class or it is wrong type. Please define one');

    if(!controller.service.refsInModel)
        throw new Error('Array refsInModel is not defined as the service member');
}

function areArgsValid(args: any[]) {
    const request = args[1];
    return request instanceof Object && request['body'] && request['query'];
}