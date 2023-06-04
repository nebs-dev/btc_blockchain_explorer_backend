import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { getApp } from './setup';
import { Model } from 'mongoose';
import { AddressesService } from '../src/addresses/addresses.service';
import { Address } from '../src/addresses/addresses.schema';

describe('AddressesController (e2e)', () => {
  let app: INestApplication;
  let addressesService: AddressesService;
  let addressModel: Model<Address>;

  beforeAll(async () => {
    app = getApp();
    await app.init();
    addressModel = app.get<Model<Address>>(getModelToken('Address'));
    addressesService = app.get(AddressesService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    // Drop the collections in the test database before each test case
    await addressModel.deleteMany({});
  });

  it('GET /addresses - should return an empty array if no addresses exist', async () => {
    // Send a GET request to the endpoint when no addresses exist
    const response = await request(app.getHttpServer())
      .get('/addresses')
      .expect(200);

    // Assert the response body
    expect(response.body).toEqual([]);
  });

  it('GET /addresses - should return addresses sorted by counter in descending order', async () => {
    // Create mock addresses with different counter values
    const mockAddresses = [
      { address: 'Address 1', counter: 2 },
      { address: 'Address 2', counter: 1 },
    ];
    await addressModel.create(mockAddresses);

    // Send a GET request to the endpoint
    const response = await request(app.getHttpServer())
      .get('/addresses')
      .expect(200);

    // Assert the response body
    expect(response.body.length).toEqual(2);
    expect(response.body[0].address).toEqual('Address 1');
    expect(response.body[1].address).toEqual('Address 2');
  });

  it('GET /addresses - should limit the number of addresses returned to 5', async () => {
    // Create more than 5 mock addresses
    const mockAddresses = [
      { address: 'Address 1', counter: 1 },
      { address: 'Address 2', counter: 2 },
      { address: 'Address 3', counter: 3 },
      { address: 'Address 4', counter: 4 },
      { address: 'Address 5', counter: 5 },
      { address: 'Address 6', counter: 6 },
    ];
    await addressModel.create(mockAddresses);

    // Send a GET request to the endpoint
    const response = await request(app.getHttpServer())
      .get('/addresses')
      .expect(200);

    // Assert the response body
    expect(response.body.length).toEqual(5);
  });

  it('GET /addresses - should handle errors and return an error response', async () => {
    // Mock the addressesService to throw an error
    jest
      .spyOn(addressesService, 'findAll')
      .mockRejectedValueOnce(new Error('Error retrieving addresses'));

    // Send a GET request to the endpoint
    const response = await request(app.getHttpServer())
      .get('/addresses')
      .expect(500);

    // Assert the response body
    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });
});
