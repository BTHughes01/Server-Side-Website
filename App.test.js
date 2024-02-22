'use strict';

const request = require('supertest');
const app = require('./App.js');

describe('Test the things service', () => {
    test('GET /data/all', () => {
        return request(app)
        .get('/data/all')
        .expect(200);
    });

    test('POST /newCustomer', () => {
        return request(app)
            .post('/newCustomer')
            .send({ name: 'test' })
            .expect(203);
    });

    test('GET /customerSoftware/c1', () => {
        return request(app)
            .get('/customerSoftware/c1')
            .expect(200);
    });

    test('GET /seller/sl1/info',()=>{
        return request(app)
            .get('/sller/sl1/info')
            .expect(200);
    })
});
