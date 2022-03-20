import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { configEnvironment } from './packages/env-config/env-config';
import { AuthMiddleware } from './packages/middlewares/auth.middleware';
import { publicUrls } from './public.url';
import { configTypeorm } from './packages/typeorm-config/typeorm.config';
import { RoleModule } from './api/role/role.module';
import { UserModule } from './api/users/user.module';
import { AuthModule } from './api/auth/auth.module';
import { FilesModule } from './api/files/files.module';

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    AuthModule,
    RoleModule,
    UserModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(...publicUrls)
      .forRoutes('*');
  }
}
