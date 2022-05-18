import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExceptionService } from '../../../../package/services/exception.service';
import { SystemException } from '../../../../package/exceptions/system.exception';
import { DeleteDto } from '../../../../package/dto/response/delete.dto';
import { isInActive } from '../../../../package/queries/is-inactive.query';
import { CreateInvoiceDto } from '../../../../package/dto/shako/create/create-invoice.dto';
import { InvoiceEntity } from '../../../../package/entities/shako/invoice.entity';
import { InvoiceDto } from '../../../../package/dto/shako/invoice.dto';
import { SchemeService } from '../../scheme/services/scheme.service';
import { RetailerService } from '../../retailer/services/retailer.service';
import { ActiveStatus } from '../../../../package/enum/active.enum';
import { UserEntity } from '../../../../package/entities/user/user.entity';
import { isActive } from '../../../../package/queries/is-active.query';
import { PermissionService } from '../../../../package/services/permission.service';
import { DistributorService } from '../../distributor/services/distributor.service';
import { InvoiceDetailsEntity } from '../../../../package/entities/shako/invoice-details.entity';
import { RequestService } from '../../../../package/services/request.service';
import { ProductEntity } from '../../../../package/entities/inventory/product.entity';
import { plainToInstance } from 'class-transformer';
import { InvoiceDetailsDto } from '../../../../package/dto/shako/invoice-details.dto';
import { Bool } from '../../../../package/enum/bool.enum';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(InvoiceDetailsEntity)
    private readonly invoiceDetailsRepository: Repository<InvoiceDetailsEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly exceptionService: ExceptionService,
    private readonly schemeService: SchemeService,
    private readonly retailerService: RetailerService,
    private readonly distributorService: DistributorService,
    private readonly permissionService: PermissionService,
    private readonly requestService: RequestService,
  ) {}

  search = async (
    page: number,
    limit: number,
    search: string,
  ): Promise<[InvoiceDto[], number]> => {
    try {
      const currentScheme = await this.schemeService.getCurrentScheme();

      const query = this.invoiceRepository
        .createQueryBuilder('q')
        .where('q.isActive =:isActive', {
          ...isActive,
        })
        .andWhere('q.scheme_id =:id', {
          id: currentScheme.id,
        });

      const isArea = this.permissionService.area();
      if (isArea.status) {
        query.andWhere('q.area_id =:areaID', {
          areaID: isArea.areaID,
        });
      }

      const isRegion = this.permissionService.region();
      if (isRegion.status) {
        query.andWhere('q.region_id =:regionID', {
          regionID: isRegion.regionID,
        });
      }

      const isTerritory = this.permissionService.territory();
      if (isTerritory.status) {
        query.andWhere('q.territory_id =:territoryID', {
          territoryID: isTerritory.territoryID,
        });
      }

      const isFa = this.permissionService.fa();
      if (isFa.status) {
        query.andWhere('q.fa_id =:faID', {
          faID: isFa.faID,
        });
      }

      query.select([
        'q.id',
        'q.memoNo',
        'q.date',
        'q.totalAmount',
        'q.discount',
        'q.problem',
        'q.remarks',
        'q.area',
        'q.region',
        'q.territory',
        'q.group',
        'q.distributor',
        'q.fa',
        'q.retailer',
        'q.scheme',
      ]);

      if (search) {
        query.andWhere(
          '((q.memoNo ILIKE  :search) OR (CAST(q.totalAmount as VARCHAR) ILIKE  :search) OR (CAST(q.date as VARCHAR) ILIKE  :search) OR (CAST(q.discount as VARCHAR) ILIKE  :search) OR (q.problem ILIKE  :search) OR (q.remarks ILIKE  :search))',
          { search: `%${search}%` },
        );
      }

      query.orderBy(`q.date`, 'DESC', 'NULLS LAST');

      if (page && limit) {
        query.skip((page - 1) * limit).take(limit);
      }

      query
        .innerJoin('q.area', 'area')
        .addSelect(['area.name', 'area.id'])
        .innerJoin('q.region', 'region')
        .addSelect(['region.name', 'region.id'])
        .innerJoin('q.territory', 'territory')
        .addSelect(['territory.name', 'territory.id'])
        .innerJoin('q.group', 'group')
        .addSelect(['group.name', 'group.id'])
        .innerJoin('q.distributor', 'distributor')
        .addSelect(['distributor.name', 'distributor.code', 'distributor.id'])
        .innerJoin('q.fa', 'fa')
        .addSelect(['fa.name', 'fa.code', 'fa.cell', 'fa.id'])
        .innerJoin('q.retailer', 'retailer')
        .addSelect([
          'retailer.name',
          'retailer.code',
          'retailer.cell',
          'retailer.proprietor',
          'retailer.bazar',
          'retailer.id',
        ])
        .innerJoin('q.scheme', 'scheme')
        .addSelect(['scheme.name', 'scheme.id']);

      const data = await query.getManyAndCount();

      return [plainToInstance(InvoiceDto, data[0]), data[1]];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  pagination = async (
    page: number,
    limit: number,
    sort: string,
    order: string,
    area: string,
    region: string,
    territory: string,
    retailer: string,
    search: string,
    startDate: string,
    endDate: string,
  ): Promise<[InvoiceDto[], number]> => {
    try {
      const currentScheme = await this.schemeService.getCurrentScheme();

      const query = this.invoiceRepository
        .createQueryBuilder('q')
        .where('q.isActive =:isActive', {
          ...isActive,
        })
        .andWhere('q.scheme_id =:id', {
          id: currentScheme.id,
        });

      const isArea = this.permissionService.area();
      if (isArea.status) {
        query.andWhere('q.area_id =:areaID', {
          areaID: isArea.areaID,
        });
      }

      const isRegion = this.permissionService.region();
      if (isRegion.status) {
        query.andWhere('q.region_id =:regionID', {
          regionID: isRegion.regionID,
        });
      }

      const isTerritory = this.permissionService.territory();
      if (isTerritory.status) {
        query.andWhere('q.territory_id =:territoryID', {
          territoryID: isTerritory.territoryID,
        });
      }

      const isFa = this.permissionService.fa();
      if (isFa.status) {
        query.andWhere('q.fa_id =:faID', {
          faID: isFa.faID,
        });
      }

      if (area) {
        query.andWhere('q.area_id =:areaID', { areaID: area });
      }

      if (region) {
        query.andWhere('q.region_id =:regionID', { regionID: region });
      }

      if (retailer) {
        query.andWhere('q.retailer_id =:retailerID', { retailerID: retailer });
      }

      if (territory) {
        query.andWhere('q.territory_id =:territoryID', {
          territoryID: territory,
        });
      }

      if (startDate && endDate) {
        startDate = new Date(startDate).toISOString().slice(0, 10);
        endDate = new Date(endDate).toISOString().slice(0, 10);

        query.andWhere('DATE(q.date)  between :startDate and :endDate', {
          startDate,
          endDate,
        });
      }

      query
        .innerJoin('q.area', 'area')
        .addSelect(['area.name', 'area.id'])
        .innerJoin('q.region', 'region')
        .addSelect(['region.name', 'region.id'])
        .innerJoin('q.territory', 'territory')
        .addSelect(['territory.name', 'territory.id'])
        .innerJoin('q.group', 'group')
        .addSelect(['group.name', 'group.id'])
        .innerJoin('q.distributor', 'distributor')
        .addSelect([
          'distributor.name',
          'distributor.code',
          'distributor.cell',
          'distributor.id',
        ])
        .innerJoin('q.fa', 'fa')
        .addSelect(['fa.name', 'fa.code', 'fa.cell', 'fa.id'])
        .innerJoin('q.retailer', 'retailer')
        .addSelect([
          'retailer.name',
          'retailer.code',
          'retailer.cell',
          'retailer.proprietor',
          'retailer.bazar',
          'retailer.id',
        ])
        .innerJoin('q.scheme', 'scheme')
        .addSelect(['scheme.name', 'scheme.id'])
        .leftJoinAndSelect('q.invoiceDetails', 'invoiceDetails')
        .leftJoinAndSelect('invoiceDetails.product', 'product')
        .innerJoinAndMapOne(
          'q.createdBy',
          UserEntity,
          'addedBy',
          'q.createdBy = addedBy.id',
        )
        .innerJoinAndMapOne(
          'q.updatedBy',
          UserEntity,
          'updatedBy',
          'q.updatedBy = updatedBy.id',
        );

      if (search) {
        query.andWhere(
          '((q.memoNo ILIKE  :search) OR (CAST(q.date as VARCHAR) ILIKE  :search) OR (CAST(q.totalAmount as VARCHAR) ILIKE  :search) OR (region.name ILIKE  :search) OR (territory.name ILIKE  :search) OR (distributor.name ILIKE  :search) OR (distributor.code ILIKE  :search) OR (fa.code ILIKE  :search) OR (fa.name ILIKE  :search) OR (retailer.code ILIKE  :search) OR (retailer.name ILIKE  :search) OR (retailer.proprietor ILIKE  :search) OR (CAST(q.createAt as VARCHAR) ILIKE  :search) OR (CAST(q.verifyStatus as VARCHAR) ILIKE  :search))',
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

      return [plainToInstance(InvoiceDto, data[0]), data[1]];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  deleted = async (
    page: number,
    limit: number,
    sort: string,
    order: string,
    area: string,
    region: string,
    territory: string,
    retailer: string,
    search: string,
    startDate: string,
    endDate: string,
  ): Promise<[InvoiceDto[], number]> => {
    try {
      const currentScheme = await this.schemeService.getCurrentScheme();

      const query = this.invoiceRepository
        .createQueryBuilder('q')
        .where('q.isActive =:isActive', {
          ...isInActive,
        })
        .andWhere('q.scheme_id =:id', {
          id: currentScheme.id,
        });

      const isArea = this.permissionService.area();
      if (isArea.status) {
        query.andWhere('q.area_id =:areaID', {
          areaID: isArea.areaID,
        });
      }

      const isRegion = this.permissionService.region();
      if (isRegion.status) {
        query.andWhere('q.region_id =:regionID', {
          regionID: isRegion.regionID,
        });
      }

      const isTerritory = this.permissionService.territory();
      if (isTerritory.status) {
        query.andWhere('q.territory_id =:territoryID', {
          territoryID: isTerritory.territoryID,
        });
      }

      const isFa = this.permissionService.fa();
      if (isFa.status) {
        query.andWhere('q.fa_id =:faID', {
          faID: isFa.faID,
        });
      }

      if (area) {
        query.andWhere('q.area_id =:areaID', { areaID: area });
      }

      if (region) {
        query.andWhere('q.region_id =:regionID', { regionID: region });
      }

      if (retailer) {
        query.andWhere('q.retailer_id =:retailerID', { retailerID: retailer });
      }

      if (territory) {
        query.andWhere('q.territory_id =:territoryID', {
          territoryID: territory,
        });
      }

      if (startDate && endDate) {
        startDate = new Date(startDate).toISOString().slice(0, 10);
        endDate = new Date(endDate).toISOString().slice(0, 10);

        query.andWhere('DATE(q.date)  between :startDate and :endDate', {
          startDate,
          endDate,
        });
      }

      query
        .innerJoin('q.area', 'area')
        .addSelect(['area.name', 'area.id'])
        .innerJoin('q.region', 'region')
        .addSelect(['region.name', 'region.id'])
        .innerJoin('q.territory', 'territory')
        .addSelect(['territory.name', 'territory.id'])
        .innerJoin('q.group', 'group')
        .addSelect(['group.name', 'group.id'])
        .innerJoin('q.distributor', 'distributor')
        .addSelect([
          'distributor.name',
          'distributor.code',
          'distributor.cell',
          'distributor.id',
        ])
        .innerJoin('q.fa', 'fa')
        .addSelect(['fa.name', 'fa.code', 'fa.cell', 'fa.id'])
        .innerJoin('q.retailer', 'retailer')
        .addSelect([
          'retailer.name',
          'retailer.code',
          'retailer.cell',
          'retailer.proprietor',
          'retailer.bazar',
          'retailer.id',
        ])
        .innerJoin('q.scheme', 'scheme')
        .addSelect(['scheme.name', 'scheme.id'])
        .leftJoinAndSelect('q.invoiceDetails', 'invoiceDetails')
        .leftJoinAndSelect('invoiceDetails.product', 'product')
        .innerJoinAndMapOne(
          'q.createdBy',
          UserEntity,
          'addedBy',
          'q.createdBy = addedBy.id',
        )
        .innerJoinAndMapOne(
          'q.updatedBy',
          UserEntity,
          'updatedBy',
          'q.updatedBy = updatedBy.id',
        );

      if (search) {
        query.andWhere(
          '((q.memoNo ILIKE  :search) OR (CAST(q.date as VARCHAR) ILIKE  :search) OR (CAST(q.totalAmount as VARCHAR) ILIKE  :search) OR (region.name ILIKE  :search) OR (territory.name ILIKE  :search) OR (distributor.name ILIKE  :search) OR (distributor.code ILIKE  :search) OR (fa.code ILIKE  :search) OR (fa.name ILIKE  :search) OR (retailer.code ILIKE  :search) OR (retailer.name ILIKE  :search) OR (retailer.proprietor ILIKE  :search) OR (CAST(q.createAt as VARCHAR) ILIKE  :search) OR (CAST(q.verifyStatus as VARCHAR) ILIKE  :search))',
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

      return [plainToInstance(InvoiceDto, data[0]), data[1]];
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (invoiceDto: CreateInvoiceDto): Promise<InvoiceDto> => {
    try {
      invoiceDto.scheme = await this.schemeService.getCurrentScheme();

      const totalAmount = invoiceDto.createInvoiceDetailsDto.reduce(
        (sum, current) => {
          return sum + current.quantity * current.unitPrice;
        },
        0,
      );
      const alreadyAvailable = await this.checkInvoiceDuplicateStatus(
        invoiceDto.distributorID,
        invoiceDto.retailerID,
        invoiceDto.memoNo,
        totalAmount,
      );

      if (alreadyAvailable) {
        throw new SystemException({
          status: HttpStatus.FORBIDDEN,
          message: 'Trying to input duplicate entry!',
        });
      }

      invoiceDto.distributor = await this.distributorService.getDistributor(
        invoiceDto.distributorID,
      );

      invoiceDto.retailer = await this.retailerService.getRetailer(
        invoiceDto.retailerID,
      );

      invoiceDto.area = invoiceDto.retailer.area;
      invoiceDto.region = invoiceDto.retailer.region;
      invoiceDto.territory = invoiceDto.retailer.territory;
      invoiceDto.group = invoiceDto.retailer.group;
      invoiceDto.fa = invoiceDto.retailer.fa;
      invoiceDto.totalAmount = totalAmount;

      const invoiceDetails: InvoiceDetailsEntity[] = [];

      for (const details of invoiceDto.createInvoiceDetailsDto) {
        let invDetails = new InvoiceDetailsEntity();
        invDetails.quantity = Number(details.quantity);
        invDetails.unitPrice = Number(details.unitPrice);
        invDetails.product = await this.getProduct(details.productID);
        invDetails =
          this.requestService.forCreate<InvoiceDetailsEntity>(invDetails);

        const created = this.invoiceDetailsRepository.create(invDetails);
        invoiceDetails.push(await this.invoiceDetailsRepository.save(created));
      }

      invoiceDto.invoiceDetails = plainToInstance(
        InvoiceDetailsDto,
        invoiceDetails,
      );

      const invoice = this.invoiceRepository.create(invoiceDto);
      await this.invoiceRepository.save(invoice);

      return this.getInvoice(invoice.id);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  update = async (
    id: string,
    invoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceDto> => {
    try {
      const savedInvoice = await this.getInvoice(id);

      invoiceDto.scheme = await this.schemeService.getCurrentScheme();

      if (invoiceDto.retailerID) {
        invoiceDto.retailer = await this.retailerService.getRetailer(
          invoiceDto.retailerID,
        );
        invoiceDto.area = invoiceDto.retailer.area;
        invoiceDto.region = invoiceDto.retailer.region;
        invoiceDto.territory = invoiceDto.retailer.territory;
        invoiceDto.group = invoiceDto.retailer.group;
        invoiceDto.fa = invoiceDto.retailer.fa;
      }

      if (invoiceDto.distributorID) {
        invoiceDto.distributor = await this.distributorService.getDistributor(
          invoiceDto.distributorID,
        );
      }

      if (invoiceDto.createInvoiceDetailsDto.length) {
        let totalAmount = 0;
        const invoiceDetails: InvoiceDetailsEntity[] = [];

        for (const details of invoiceDto.createInvoiceDetailsDto) {
          const oldInvoiceDetail = await this.getInvoiceDetailByInvoiceID(id);

          await this.removeInvoiceDetails(id);

          let invDetails = new InvoiceDetailsEntity();
          invDetails.quantity = Number(details.quantity);
          invDetails.unitPrice = Number(details.unitPrice);
          invDetails.product = await this.getProduct(details.productID);

          totalAmount += invDetails.quantity * invDetails.unitPrice;

          // preserve the previous date
          invDetails.createdBy = oldInvoiceDetail.createdBy;
          invDetails.createAt = oldInvoiceDetail.createAt;

          invDetails =
            this.requestService.forUpdate<InvoiceDetailsEntity>(invDetails);

          const created = this.invoiceDetailsRepository.create(invDetails);
          invoiceDetails.push(
            await this.invoiceDetailsRepository.save(created),
          );
        }

        invoiceDto.invoiceDetails = plainToInstance(
          InvoiceDetailsDto,
          invoiceDetails,
        );
        invoiceDto.totalAmount = totalAmount;
      }

      await this.invoiceRepository.save({
        ...savedInvoice,
        ...invoiceDto,
      });

      return this.getInvoice(id);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  remove = async (id: string): Promise<DeleteDto> => {
    try {
      const savedInvoice = await this.getInvoice(id);

      await this.softRemoveInvoiceDetails(id);

      await this.invoiceRepository.save({
        ...savedInvoice,
        ...isInActive,
      });

      return Promise.resolve(new DeleteDto(true));
    } catch (error) {
      throw new SystemException(error);
    }
  };

  restore = async (id: string): Promise<DeleteDto> => {
    try {
      const savedInvoice = await this.getDeletedInvoice(id);

      await this.invoiceRepository.save({
        ...savedInvoice,
        ...isActive,
      });
      return Promise.resolve(new DeleteDto(true));
    } catch (error) {
      throw new SystemException(error);
    }
  };

  verify = async (id: string): Promise<boolean> => {
    try {
      const savedInvoice = await this.getInvoice(id);
      if (savedInvoice.verifyStatus === Bool.Yes) {
        throw new SystemException({
          status: HttpStatus.FORBIDDEN,
          message: 'Already verified',
        });
      }

      savedInvoice.verifyStatus = Bool.Yes;

      await this.invoiceRepository.save({
        ...savedInvoice,
      });

      return Promise.resolve(true);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  distributorCheck = async (id: string): Promise<boolean> => {
    try {
      const savedInvoice = await this.getInvoice(id);
      if (savedInvoice.distributorCheck === Bool.Yes) {
        throw new SystemException({
          status: HttpStatus.FORBIDDEN,
          message: 'Already Yes',
        });
      }

      savedInvoice.distributorCheck = Bool.Yes;

      await this.invoiceRepository.save({
        ...savedInvoice,
      });

      return Promise.resolve(true);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  revertVerify = async (id: string): Promise<boolean> => {
    try {
      const savedInvoice = await this.getInvoice(id);
      if (savedInvoice.verifyStatus === Bool.No) {
        throw new SystemException({
          status: HttpStatus.FORBIDDEN,
          message: 'Already reverted!',
        });
      }

      savedInvoice.verifyStatus = Bool.No;

      await this.invoiceRepository.save({
        ...savedInvoice,
      });

      return Promise.resolve(true);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findById = async (id: string): Promise<InvoiceDto> => {
    try {
      return await this.getInvoice(id);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  /********************** Start checking relations of post ********************/
  getInvoice = async (id: string): Promise<InvoiceDto> => {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('q')
      .where('q.id = :id', { id })
      .andWhere('q.isActive = :active', {
        active: ActiveStatus.enabled,
      })
      .innerJoin('q.area', 'area')
      .addSelect(['area.name', 'area.id'])
      .innerJoin('q.region', 'region')
      .addSelect(['region.name', 'region.id'])
      .innerJoin('q.territory', 'territory')
      .addSelect(['territory.name', 'territory.id'])
      .innerJoin('q.group', 'group')
      .addSelect(['group.name', 'group.id'])
      .innerJoin('q.distributor', 'distributor')
      .addSelect(['distributor.name', 'distributor.code', 'distributor.id'])
      .innerJoin('q.fa', 'fa')
      .addSelect(['fa.name', 'fa.code', 'fa.cell', 'fa.id'])
      .innerJoin('q.retailer', 'retailer')
      .addSelect([
        'retailer.name',
        'retailer.code',
        'retailer.cell',
        'retailer.proprietor',
        'retailer.bazar',
        'retailer.id',
      ])
      .innerJoin('q.scheme', 'scheme')
      .addSelect(['scheme.name', 'scheme.id'])
      .getOne();
    this.exceptionService.notFound(invoice, 'Invoice Not Found!!');

    return plainToInstance(InvoiceDto, invoice);
  };

  getDeletedInvoice = async (id: string): Promise<InvoiceDto> => {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('q')
      .where('q.id = :id', { id })
      .andWhere('q.isActive = :active', {
        active: ActiveStatus.disabled,
      })
      .innerJoin('q.area', 'area')
      .addSelect(['area.name', 'area.id'])
      .innerJoin('q.region', 'region')
      .addSelect(['region.name', 'region.id'])
      .innerJoin('q.territory', 'territory')
      .addSelect(['territory.name', 'territory.id'])
      .innerJoin('q.group', 'group')
      .addSelect(['group.name', 'group.id'])
      .innerJoin('q.distributor', 'distributor')
      .addSelect(['distributor.name', 'distributor.code', 'distributor.id'])
      .innerJoin('q.fa', 'fa')
      .addSelect(['fa.name', 'fa.code', 'fa.cell', 'fa.id'])
      .innerJoin('q.retailer', 'retailer')
      .addSelect([
        'retailer.name',
        'retailer.code',
        'retailer.cell',
        'retailer.proprietor',
        'retailer.bazar',
        'retailer.id',
      ])
      .innerJoin('q.scheme', 'scheme')
      .addSelect(['scheme.name', 'scheme.id'])
      .getOne();
    this.exceptionService.notFound(invoice, 'Invoice Not Found!!');

    return plainToInstance(InvoiceDto, invoice);
  };

  getInvoiceDetailByInvoiceID = async (
    invoiceID: string,
  ): Promise<InvoiceDetailsDto> => {
    const invoiceDetail = await this.invoiceDetailsRepository
      .createQueryBuilder('q')
      .where('q.invoice_id =:invID', { invID: invoiceID })
      .getOne();
    this.exceptionService.notFound(
      invoiceDetail,
      'Invoice Details Not Found!!',
    );

    return plainToInstance(InvoiceDetailsDto, invoiceDetail);
  };

  async removeInvoiceDetails(invoiceID: string): Promise<boolean> {
    return !!(await this.invoiceDetailsRepository
      .createQueryBuilder('q')
      .where('q.invoice_id =:invID', {
        invID: invoiceID,
      })
      .delete());
  }

  async softRemoveInvoiceDetails(invoiceID: string): Promise<boolean> {
    const saleDetail = await this.getInvoiceDetailByInvoiceID(invoiceID);
    return !!(await this.invoiceDetailsRepository.save({
      ...saleDetail,
      ...isInActive,
    }));
  }

  getProduct = async (id: string): Promise<ProductEntity> => {
    const product = await this.productRepository
      .createQueryBuilder('q')
      .where('q.id =:id', { id })
      .andWhere('q.isActive =:active', {
        active: ActiveStatus.enabled,
      })
      .getOne();
    this.exceptionService.notFound(product, 'Product Not Found!!');

    return product;
  };

  checkInvoiceDuplicateStatus = async (
    distributorID: string,
    retailerID: string,
    memoNo: string,
    totalAmount: number,
  ): Promise<boolean> => {
    const alreadyAvailable = await this.invoiceRepository
      .createQueryBuilder('q')
      .where('q.isActive =:isActive', {
        ...isActive,
      })
      .andWhere('q.distributor_id =:distributorID', {
        distributorID,
      })
      .andWhere('q.retailer_id =:retailerID', {
        retailerID,
      })
      .andWhere('q.totalAmount =:totalAmount', {
        totalAmount,
      })
      .andWhere('q.memoNo =:memoNo', {
        memoNo,
      })
      .getCount();
    return Promise.resolve(!!alreadyAvailable);
  };
  /*********************** End checking relations of post *********************/
}
