import { Column, Entity, Index } from 'typeorm';
import { CustomBaseEntity } from '../core/custom-base.entity';

@Entity({ name: 'products' })
@Index('products-name-deletedat-idx', ['name', 'deletedAt'])
export class ProductEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', name: 'code', length: 65 })
  @Index('products-name-idx', { unique: false })
  name: string;

  @Column({ type: 'varchar', name: 'pack', length: 65 })
  packSize: string;
}
