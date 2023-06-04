import { MongoClient } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import config from '../src/config/config';
import { TestAppModule } from './test-app.module';

let app: INestApplication;
let mongoClient: MongoClient;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [TestAppModule, MongooseModule.forRoot(config().test_db.uri)],
  }).compile();

  app = moduleFixture.createNestApplication();

  // Apply the ValidationPipe globally
  app.useGlobalPipes(new ValidationPipe());

  await app.init();

  // Connect to the test database
  mongoClient = await MongoClient.connect(config().test_db.uri);
});

afterAll(async () => {
  await app.close();

  // Drop the test database
  await mongoClient.db().dropDatabase();

  // Close the MongoDB connection
  await mongoClient.close();
});

export const getApp = () => {
  return app;
};
