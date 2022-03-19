import { Allow } from 'class-validator';
import { ActiveStatus } from '../../enum/active.enum';

export abstract class BaseDto {
  @Allow()
  id: string;

  @Allow()
  version: number;

  @Allow()
  isActive: ActiveStatus;

  @Allow()
  createdBy: string | null;

  @Allow()
  updatedBy: string | null;

  @Allow()
  createAt: Date | null;

  @Allow()
  updatedAt: Date | null;
}
