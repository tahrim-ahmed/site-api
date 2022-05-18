import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../core/custom-base.entity';
import { RetailerEntity } from './retailer.entity';
import { StringToNumericTransformer } from '../../transformers/string-to-numeric.transformer';
import { SchemeEntity } from './scheme.entity';
import { AreaEntity } from './area.entity';
import { RegionEntity } from './region.entity';
import { TerritoryEntity } from './territory.entity';
import { GroupEntity } from './group.entity';
import { DistributorEntity } from './distributor.entity';
import { FaEntity } from './fa.entity';
import { InvoiceDetailsEntity } from './invoice-details.entity';
import { Bool } from '../../enum/bool.enum';

@Entity({ name: 'invoices' })
export class InvoiceEntity extends CustomBaseEntity {
  @Column({ type: 'text', name: 'file', nullable: false })
  file: string;

  @Column({ type: 'varchar', name: 'memo_no', length: 255, nullable: false })
  memoNo: string;

  @Column({
    type: 'timestamp without time zone',
    name: 'date',
    nullable: false,
  })
  date: Date | null;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    precision: 20,
    scale: 6,
    default: () => "'0.000000'",
    transformer: new StringToNumericTransformer(),
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    name: 'discount',
    precision: 20,
    scale: 6,
    default: () => "'0.000000'",
    transformer: new StringToNumericTransformer(),
  })
  discount: number;

  @Column({ type: 'text', name: 'remarks', nullable: true })
  remarks: string;

  @Column({
    type: 'enum',
    name: 'distributor_check',
    enum: Bool,
    default: `${Bool.Yes}`,
  })
  distributorCheck: Bool;

  @Column({
    type: 'enum',
    name: 'verify_status',
    enum: Bool,
    default: `${Bool.No}`,
  })
  verifyStatus: Bool;

  @OneToMany(
    () => InvoiceDetailsEntity,
    (invoiceDetailsEntity) => invoiceDetailsEntity.invoice,
  )
  @JoinColumn({ name: 'invoice_id' })
  invoiceDetails: InvoiceDetailsEntity[];

  //removed field
  @Column({ type: 'text', name: 'problem', nullable: true })
  problem: string;

  @ManyToOne(() => SchemeEntity, (schemeEntity) => schemeEntity.invoices)
  @JoinColumn({ name: 'scheme_id' })
  scheme: SchemeEntity;

  @ManyToOne(() => AreaEntity, (areaEntity) => areaEntity.invoices)
  @JoinColumn({ name: 'area_id' })
  area: AreaEntity;

  @ManyToOne(() => RegionEntity, (regionEntity) => regionEntity.invoices)
  @JoinColumn({ name: 'region_id' })
  region: RegionEntity;

  @ManyToOne(
    () => TerritoryEntity,
    (territoryEntity) => territoryEntity.invoices,
  )
  @JoinColumn({ name: 'territory_id' })
  territory: TerritoryEntity;

  @ManyToOne(() => GroupEntity, (groupEntity) => groupEntity.invoices)
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @ManyToOne(
    () => DistributorEntity,
    (distributorEntity) => distributorEntity.invoices,
  )
  @JoinColumn({ name: 'distributor_id' })
  distributor: DistributorEntity;

  @ManyToOne(() => FaEntity, (faEntity) => faEntity.invoices)
  @JoinColumn({ name: 'fa_id' })
  fa: FaEntity;

  @ManyToOne(() => RetailerEntity, (retailerEntity) => retailerEntity.invoices)
  @JoinColumn({ name: 'retailer_id' })
  retailer: RetailerEntity;
}
