import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../entities/user/role.entity';
import { UserEntity } from '../entities/user/user.entity';
import { UserRoleEntity } from '../entities/user/user-role.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_DB'),
        entities: [UserEntity, UserRoleEntity, RoleEntity],
        synchronize: <boolean>(
          (configService.get<number>('DATABASE_SYNCRONIZE') == 1)
        ),
        logging:
          configService.get<number>('DATABASE_LOGGING') == 1
            ? ['error', 'warn', 'info', 'schema', 'log']
            : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TypeormConfigModule {}
