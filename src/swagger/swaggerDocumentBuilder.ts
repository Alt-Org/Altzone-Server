import {DocumentBuilder} from "@nestjs/swagger";
import {SwaggerTag} from "./tags/tags";

/**
 * Wrapper class for Nest's DocumentBuilder, which adds some additional building methods
 */
export class SwaggerDocumentBuilder extends DocumentBuilder {
    /**
     * Add multiple swagger tags.
     *
     * @property tags tags to add
     */
    addTags(tags: SwaggerTag[]): this {
        let that = this;
        for (const tag of tags)
            that = that.addTag(tag.name, tag.description, tag.externalDocs);

        return that;
    }
}
