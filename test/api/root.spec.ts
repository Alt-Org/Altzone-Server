import app from "../../src";
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);
const expect = chai.expect;

describe('API root request', () => {
    it('should return status 200', () => {
        return chai.request(app).get('/')
            .then(res => {
                chai.expect(res.status).to.eql(200);
            });
    });
})