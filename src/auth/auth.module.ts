import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtMiddleware } from './jwt.middleware';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey', // Use environment variable in production
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(jwtMiddleware)
      .forRoutes(
        { path: 'users/search', method: RequestMethod.GET },
        { path: 'block/:blockedUserId', method: RequestMethod.PUT },
        { path: 'block/:blockedUserId/unblock', method: RequestMethod.PUT },
      );
  }
}
