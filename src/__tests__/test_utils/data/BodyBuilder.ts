export default class BodyBuilder {
    private readonly base = {
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(8),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
        json: async () => ({}),
        text: async () => ''
    };

    build(): Body {
        return { ...this.base } as Body;
    }

    setBody(body: ReadableStream<Uint8Array> | null) {
        this.base.body = body;
        return this;
    }

    setBodyUsed(bodyUsed: boolean) {
        this.base.bodyUsed = bodyUsed;
        return this;
    }

    setArrayBuffer(arrayBuffer: ArrayBuffer) {
        this.base.arrayBuffer = async () => arrayBuffer;
        return this;
    }

    setBlob(blob: Blob) {
        this.base.blob = async () => blob;
        return this;
    }

    setFormData(formData: FormData) {
        this.base.formData = async () => formData;
        return this;
    }

    setJson(json: any) {
        this.base.json = async () => json;
        return this;
    }

    setText(text: string) {
        this.base.text = async () => text;
        return this;
    }
}