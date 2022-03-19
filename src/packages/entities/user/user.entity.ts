import { Column, Entity, Index, JoinColumn, OneToMany } from 'typeorm';
import { CustomBaseEntity } from '../core/custom-base.entity';
import { UserRoleEntity } from './user-role.entity';
import { Payment } from '../../enum/payment.enum';

@Entity({ name: 'users' })
@Index('users-first-name-isactive-idx', ['lastName', 'isActive'])
@Index('users-last-name-isactive-idx', ['firstName', 'isActive'])
@Index('users-email-isactive-idx', ['email', 'isActive'])
@Index('users-phone-isactive-idx', ['phone', 'isActive'])
export class UserEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', name: 'first_name', length: 65 })
  @Index('users-first-name-idx', { unique: false })
  firstName: string;

  @Column({ type: 'varchar', name: 'last_name', length: 65, nullable: true })
  @Index('users-last-name-idx', { unique: false })
  lastName: string;

  @Column({ type: 'varchar', name: 'email', length: 100, nullable: true })
  @Index('users-email-idx', { unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'phone', length: 20, nullable: true })
  @Index('users-phone-idx', { unique: true })
  phone: string;

  @Column({ type: 'varchar', name: 'password', length: 100, nullable: true })
  password: string;

  @Column({
    type: 'enum',
    name: 'payment',
    enum: Payment,
    default: `${Payment.Unpaid}`,
  })
  payment: Payment;

  /*@Column({
    type: 'enum',
    name: 'notify',
    enum: Bool,
    default: `${Bool.Yes}`,
  })
  notify: Payment;*/

  @OneToMany(() => UserRoleEntity, (userRoleEntity) => userRoleEntity.user)
  @JoinColumn({ name: 'user_id' })
  roles: UserRoleEntity[];
}
