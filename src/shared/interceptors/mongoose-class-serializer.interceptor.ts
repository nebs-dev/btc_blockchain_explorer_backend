import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { Document } from 'mongoose';

export function MongooseClassSerializerInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(obj: PlainLiteralObject) {
      if (obj instanceof Document) {
        return plainToClass(classToIntercept, obj.toJSON());
      }
      return plainToClass(classToIntercept, obj);
    }

    private prepareResponse(
      response: PlainLiteralObject | PlainLiteralObject[],
    ) {
      if (Array.isArray(response)) {
        return response.map(this.changePlainObjectToClass);
      }
      return this.changePlainObjectToClass(response);
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}
