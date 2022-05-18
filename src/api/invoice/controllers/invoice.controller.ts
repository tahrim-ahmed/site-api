import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseService } from '../../../../package/services/response.service';
import { RequestService } from '../../../../package/services/request.service';
import { ResponseDto } from '../../../../package/dto/response/response.dto';
import { DtoValidationPipe } from '../../../../package/pipes/dto-validation.pipe';
import { InvoiceService } from '../services/invoice.service';
import { UuidValidationPipe } from '../../../../package/pipes/uuid-validation.pipe';
import { CreateInvoiceDto } from '../../../../package/dto/shako/create/create-invoice.dto';
import { FaGuard } from '../../../../package/guards/fa.guard';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import { IntValidationPipe } from '../../../../package/pipes/int-validation.pipe';
import { ManagementGuard } from '../../../../package/guards/management.guard';
import { SuperAdminGuard } from '../../../../package/guards/super.admin.guard';

@ApiTags('Invoice')
@ApiBearerAuth()
@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @ApiImplicitQuery({
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
    const invoices = this.invoiceService.search(page, limit, search);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      invoices,
    );
  }

  @ApiImplicitQuery({
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'order',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'area',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'region',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'territory',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'retailer',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'startDate',
    required: false,
    type: String,
  })
  @ApiImplicitQuery({
    name: 'endDate',
    required: false,
    type: String,
  })
  @Get('pagination')
  pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
    @Query('area') area: string,
    @Query('region') region: string,
    @Query('territory') territory: string,
    @Query('retailer') retailer: string,
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ResponseDto> {
    const invoices = this.invoiceService.pagination(
      page,
      limit,
      sort,
      order,
      area,
      region,
      territory,
      retailer,
      search,
      startDate,
      endDate,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      invoices,
    );
  }

  @Get('deleted')
  deleted(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
    @Query('area') area: string,
    @Query('region') region: string,
    @Query('territory') territory: string,
    @Query('retailer') retailer: string,
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ResponseDto> {
    const invoices = this.invoiceService.deleted(
      page,
      limit,
      sort,
      order,
      area,
      region,
      territory,
      retailer,
      search,
      startDate,
      endDate,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      invoices,
    );
  }

  @UseGuards(new FaGuard())
  @ApiCreatedResponse({
    description: 'Invoice successfully added!!',
  })
  @ApiBody({ type: CreateInvoiceDto })
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    invoiceDto: CreateInvoiceDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(invoiceDto);
    const invoice = this.invoiceService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Invoice successfully added!!',
      invoice,
    );
  }

  @UseGuards(new FaGuard())
  @ApiOkResponse({
    description: 'Invoice successfully updated!!',
  })
  @ApiBody({ type: CreateInvoiceDto })
  @Put(':id')
  update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    invoiceDto: CreateInvoiceDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(invoiceDto);
    const invoice = this.invoiceService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Invoice successfully updated!!',
      invoice,
    );
  }

  @UseGuards(new ManagementGuard())
  @ApiOkResponse({ description: 'Invoice successfully deleted!' })
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.invoiceService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Invoice successfully deleted!',
      deleted,
    );
  }

  @UseGuards(new SuperAdminGuard())
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Invoice successfully restored!' })
  @Delete(':id/restore')
  restore(@Param('id', new UuidValidationPipe()) id: string): Promise<any> {
    const invoiceDto = this.invoiceService.restore(id);
    return this.responseService.toResponse(
      <number>HttpStatus.OK,
      'Invoice successfully restored!',
      invoiceDto,
    );
  }

  @UseGuards(new ManagementGuard())
  @ApiOkResponse({ description: 'Invoice successfully verified!' })
  @Patch('verify/:id')
  verify(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const verified = this.invoiceService.verify(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Invoice successfully verified!',
      verified,
    );
  }

  @UseGuards(new ManagementGuard())
  @ApiOkResponse({ description: 'Distributor check successfully changed!' })
  @Patch('distributor-check/:id')
  distributorCheck(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const verified = this.invoiceService.distributorCheck(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Distributor check successfully changed!',
      verified,
    );
  }

  @UseGuards(new ManagementGuard())
  @ApiOkResponse({ description: 'Verification successfully reverted!' })
  @Patch('revert-verify/:id')
  revertVerify(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const revertVerified = this.invoiceService.revertVerify(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Verification successfully reverted!',
      revertVerified,
    );
  }

  @Get(':id')
  findById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const invoices = this.invoiceService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, invoices);
  }
}
