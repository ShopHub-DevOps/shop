import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  walletAddress?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;
}
