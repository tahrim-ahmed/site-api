import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from '../../../package/services/response.service';
import { ExceptionService } from '../../../package/services/exception.service';
import { RequestService } from '../../../package/services/request.service';
import { InvoiceService } from './services/invoice.service';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceEntity } from '../../../package/entities/shako/invoice.entity';
import { SchemeModule } from '../scheme/scheme.module';
import { RetailerModule } from '../retailer/retailer.module';
import { PermissionService } from '../../../package/services/permission.service';
import { DistributorModule } from '../distributor/distributor.module';
import { InvoiceDetailsEntity } from '../../../package/entities/shako/invoice-details.entity';
import { ProductEntity } from '../../../package/entities/inventory/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEntity,
      InvoiceDetailsEntity,
      ProductEntity,
    ]),
    SchemeModule,
    RetailerModule,
    DistributorModule,
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    ResponseService,
    ExceptionService,
    RequestService,
    PermissionService,
  ],
})
export class InvoiceModule {}
