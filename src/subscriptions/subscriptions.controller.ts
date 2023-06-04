import {
  Controller,
  Get,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './subscriptions.schema';
import { ErrorType } from '../errors/types/error-request.type';
import { AuthGuard } from '../auth/auth.guard';
import { Types } from 'mongoose';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';

@Controller('subscriptions')
@SerializeOptions({
  excludePrefixes: ['_'],
})
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(Subscription))
  async subscriptions(@Request() req): Promise<Subscription[] | ErrorType> {
    return await this.subscriptionsService.findAllByUserId(
      new Types.ObjectId(req.user.userId),
    );
  }
}
