import {ApiTags} from "@nestjs/swagger";
import {SwaggerTagName} from "./tags";

/**
 * Adds tags to a controller class or to its method to be added to the generated from JSDocs swagger
 * @param tags tags to add separated by comma
 */
export default function SwaggerTags(...tags: SwaggerTagName[]) {
    return ApiTags(...tags);
}
