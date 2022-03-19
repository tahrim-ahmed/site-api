import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { ActiveStatus } from '../../enum/active.enum';

export class CustomBaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;

  @Column({
    type: 'enum',
    name: 'is_active',
    enum: ActiveStatus,
    default: `${ActiveStatus.enabled}`,
  })
  isActive: ActiveStatus;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string | null;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    nullable: true,
  })
  createAt: Date | null;

  @Column({
    type: 'timestamp',
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date | null;
}
