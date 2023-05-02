import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  private currentPassword: string;

  @AfterLoad()
  private saveCurrentPassword() {
    this.currentPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword(): void {
    if (this.currentPassword !== this.password) {
      const buffer = new Buffer(this.password);
      this.password = buffer.toString('base64');
    }
  }
}
