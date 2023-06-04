import { Module } from '@nestjs/common';
import { ErrorsService } from './errors.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ErrorsService],
  exports: [ErrorsService],
})
export class ErrorsModule {}
