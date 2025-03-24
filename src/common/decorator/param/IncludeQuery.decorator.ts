import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ModelName } from '../../enum/modelName.enum';
import { APIError } from '../../controller/APIError';
import { APIErrorReason } from '../../controller/APIErrorReason';

/**
 * Get the `with` or `all` query from the client request.
 *
 * The `with` query specifies which related documents must be fetched.
 * For example if Clan data was fetched, and the Clan has Stock and SoulHome they data can be fetched as well together with Clan data.
 *
 * The `all` query specifies that all related documents to the collection must be fetched.
 *
 * If both the `all` and the `with` queries are specified `all` query will overwrite the `with` query.
 *
 * The returned value is an array of the ModelNames, which need to be retrieved
 *
 * @see [Mongoose Populate](https://mongoosejs.com/docs/populate.html)
 */
export const IncludeQuery = createParamDecorator(
  (allowedReferences: ModelName[], context: ExecutionContext): ModelName[] => {
    if (!allowedReferences)
      throw new APIError({
        reason: APIErrorReason.MISCONFIGURED,
        message:
          '@IncludeQuery() requires array of allowed references of the model parameter',
        field: 'allowedReferences',
        value: allowedReferences,
      });

    const request = context.switchToHttp().getRequest<Request>();
    const withQuery = request.query['with'];
    const allQuery = request.query['all'];

    if (allQuery || allQuery === '') return allowedReferences;

    if (!withQuery || typeof withQuery !== 'string') return [];

    const withRefs: ModelName[] = withQuery.split('_') as ModelName[];
    if (withRefs.length === 0) return [];

    return withRefs.filter((requestedRef) =>
      allowedReferences.includes(requestedRef),
    );
  },
);
