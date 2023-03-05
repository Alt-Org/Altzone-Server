"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importDefault(require("../../src"));
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
require("mocha");
chai_1.default.use(chai_http_1.default);
const expect = chai_1.default.expect;
describe('API root request', () => {
    it('should return status 200', () => {
        return chai_1.default.request(src_1.default).get('/')
            .then(res => {
            chai_1.default.expect(res.status).to.eql(200);
        });
    });
});
