import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UserEntity } from '../../../packages/entities/user/user.entity';
import { RoleEntity } from '../../../packages/entities/user/role.entity';
import { UserRoleEntity } from '../../../packages/entities/user/user-role.entity';
import { ResponseService } from '../../../packages/services/response.service';
import { ExceptionService } from '../../../packages/services/exception.service';
import { BcryptService } from '../../../packages/services/bcrypt.service';
import { RequestService } from '../../../packages/services/request.service';
import { UserResponseDto } from '../../../packages/dto/response/user-response.dto';
import { UserDto } from '../../../packages/dto/user/user.dto';
import { isActive } from '../../../packages/queries/is-active.query';
import { SystemException } from '../../../packages/exceptions/system.exception';
import { CreateUserDto } from '../../../packages/dto/user/create/create-user.dto';
import { RoleName } from '../../../packages/enum/role-name.enum';
import { UserType } from '../../../packages/enum/user-type.enum';
import { ChangePasswordDto } from '../../../packages/dto/user/change-password.dto';
import { DeleteDto } from '../../../packages/dto/response/delete.dto';
import { isInActive } from '../../../packages/queries/is-inactive.query';
import { UserRoleDto } from '../../../packages/dto/user/user-role.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    private readonly configService: ConfigService,
    private readonly responseService: ResponseService,
    private readonly exceptionService: ExceptionService,
    private readonly bcryptService: BcryptService,
    private readonly requestService: RequestService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  getLoggedUser = (): UserResponseDto => {
    return this.request['_user'] as UserResponseDto;
  };

  findAll = async (): Promise<UserDto[]> => {
    try {
      const users = await this.userRepository.find({ ...isActive });
      return plainToInstance(UserDto, users);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findOne = async (dto: UserDto): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        ...dto,
        ...isActive,
      });
      this.exceptionService.notFound(user, 'User is not found');
      return plainToClass(UserDto, user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findOneByEmailOrPhone = async (
    emailOrPhone: string,
    mustReturn = false,
  ): Promise<UserDto> => {
    try {
      const query = this.userRepository.createQueryBuilder('user');

      const user = await query
        .where(
          '(user.phone = :phone OR user.email = :email) and user.isActive = :isActive',
          {
            phone: emailOrPhone,
            email: emailOrPhone,
            ...isActive,
          },
        )
        .getOne();

      if (!mustReturn) {
        this.exceptionService.notFound(
          user,
          'User is not found by phone or email',
        );
      }

      return plainToClass(UserDto, user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (createUserDto: CreateUserDto): Promise<UserDto> => {
    try {
      const user = await this.createUser(createUserDto);

      return plainToClass(UserDto, user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  createUser = async (createUserDto: CreateUserDto): Promise<UserEntity> => {
    createUserDto.password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );

    let userDto = createUserDto as UserDto;
    userDto = this.requestService.forCreate(userDto);
    const user = this.userRepository.create(userDto);

    const savedUser = await this.userRepository.save(user);

    switch (createUserDto.type) {
      case UserType.ADMIN: {
        await this.createUserTypeRole(savedUser, RoleName.ADMIN_ROLE);
        break;
      }
      case UserType.USER: {
        await this.createUserTypeRole(savedUser, RoleName.USER_ROLE);
        break;
      }
    }
    return savedUser;
  };

  createUserTypeRole = async (
    user: UserEntity,
    role: RoleName,
  ): Promise<boolean> => {
    let userRole = new UserRoleEntity();
    userRole.user = user;
    userRole.role = await this.getRoleByName(role);
    userRole = this.requestService.forCreate(userRole);
    return Promise.resolve(!!(await this.userRoleRepository.save(userRole)));
  };

  update = async (id: string, userDto: UserDto): Promise<UserDto> => {
    try {
      if (userDto.password) {
        userDto.password = await this.bcryptService.hashPassword(
          userDto.password,
        );
      }

      const savedUser = await this.getUser(id);

      userDto = this.requestService.forUpdate(userDto);

      const updatedUser = await this.userRepository.save({
        ...savedUser,
        ...userDto,
      });

      return plainToClass(UserDto, updatedUser);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  updatePassword = async (
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserDto> => {
    try {
      const savedUser = await this.getUser(changePasswordDto.userID);

      savedUser.password = await this.bcryptService.hashPassword(
        changePasswordDto.newPassword,
      );
      const updatedUser = await this.userRepository.save({
        ...savedUser,
        // save password reset time
        lastPasswdGen: new Date(),
      });

      return plainToClass(UserDto, updatedUser);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  remove = async (id: string): Promise<DeleteDto> => {
    try {
      const savedUser = await this.getUser(id);

      await this.userRepository.save({
        ...savedUser,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(true));
    } catch (error) {
      throw new SystemException(error);
    }
  };

  pagination = async (
    page: number,
    limit: number,
    sort: string,
    order: string,
    search: string,
  ): Promise<[UserDto[], number]> => {
    try {
      const query = this.userRepository.createQueryBuilder('q');
      query.where('q.isActive =:isActive', {
        ...isActive,
      });

      if (search) {
        query.andWhere(
          '((q.firstName ILIKE  :search) OR (q.lastName ILIKE  :search) OR (q.phone ILIKE  :search) OR (q.email ILIKE  :search))',
          { search: `%${search}%` },
        );
      }

      if (sort && sort !== 'undefined') {
        if (order && order !== 'undefined') {
          let direction: 'DESC' | 'ASC' = 'DESC';
          if (['DESC', 'ASC'].includes(order.toUpperCase())) {
            direction = order.toUpperCase() as 'DESC' | 'ASC';
            query.orderBy(`q.${sort}`, direction, 'NULLS LAST');
          } else {
            query.orderBy(`q.${sort}`, direction, 'NULLS LAST');
          }
        } else {
          query.orderBy(`q.${sort}`, 'DESC', 'NULLS LAST');
        }
      } else {
        query.orderBy(`q.updatedAt`, 'DESC', 'NULLS LAST');
      }

      if (page && limit) {
        query.skip((page - 1) * limit).take(limit);
      }

      const data = await query.getManyAndCount();

      return [plainToInstance(UserDto, data[0]), data[1]];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findById = async (id: string, relation = true): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne(
        { id, ...isActive },
        {
          relations: relation ? ['roles'] : [],
        },
      );
      this.exceptionService.notFound(user, 'User is not found');
      user.password = undefined;
      return plainToClass(UserDto, user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  /************************ relation *******************/
  getUser = async (id: string): Promise<UserEntity> => {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(user, 'User not found!!');
    return user;
  };

  getRole = async (id: string): Promise<RoleEntity> => {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(role, 'Role not found!!');
    return role;
  };

  getRoleByName = async (role: RoleName): Promise<RoleEntity> => {
    const roleByName = await this.roleRepository.findOne({
      where: {
        role,
        ...isActive,
      },
    });
    this.exceptionService.notFound(roleByName, 'Role not found!!');
    return roleByName;
  };

  /************************ for login *******************/

  findRolesByUserId = async (id: string): Promise<UserRoleDto[]> => {
    try {
      const query = this.userRoleRepository.createQueryBuilder('userRole');
      const userRoles = await query
        .innerJoin('userRole.user', 'user', 'user.id=:id', { id })
        .innerJoinAndSelect('userRole.role', 'role')
        .getMany();
      return plainToClass(UserRoleDto, userRoles);
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
