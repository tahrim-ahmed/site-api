import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { RoleService } from '../service/role.service';
import { ResponseService } from '../../../packages/services/response.service';
import { IntValidationPipe } from '../../../packages/pipes/int-validation.pipe';
import { ResponseDto } from '../../../packages/dto/response/response.dto';
import { UuidValidationPipe } from '../../../packages/pipes/uuid-validation.pipe';
import { RoleDto } from '../../../packages/dto/user/role.dto';
import { DtoValidationPipe } from '../../../packages/pipes/dto-validation.pipe';

@ApiTags('Role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(
    private roleService: RoleService,
    private readonly responseService: ResponseService,
  ) {}

  /*@ApiImplicitQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @Get('search')
  search(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('search') search: string,
  ): Promise<ResponseDto> {
    const allRole = this.roleService.search(page, limit, search);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      allRole,
    );
  }*/

  /*@Get()
  findAll(): Promise<ResponseDto> {
    const roleDto = this.roleService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, roleDto);
  }*/

  /*@Get(':id')
  findById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const roleDto = this.roleService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, roleDto);
  }*/

  /*@Post('find')
  findOne(@Body() dto: RoleDto): Promise<ResponseDto> {
    const roleDto = this.roleService.findByObject(dto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      <any>roleDto,
    );
  }*/

  @Post()
  create(@Body() dto: RoleDto): Promise<ResponseDto> {
    const roleDto = this.roleService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Role created Successfully',
      roleDto,
    );
  }

  /*@Put(':id')
  update(@Param('id') id: string, @Body() dto: RoleDto): Promise<ResponseDto> {
    const roleDto = this.roleService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Role updated successfully',
      roleDto,
    );
  }*/

  /*@Post()
  createRole(
    @Body(new DtoValidationPipe()) roleDto: RoleDto,
  ): Promise<RoleDto> {
    return this.roleService.create(roleDto);
  }*/

  /*@Delete(':id')
  remove(@Param('id') id: string): Promise<ResponseDto> {
    const roleDto = this.roleService.remove(id);
    return this.responseService.toResponse(
      <number>HttpStatus.OK,
      'Role deleted successfully',
      roleDto,
    );
  }*/
}
