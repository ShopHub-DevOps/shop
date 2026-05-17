import { AppDataSource } from './data-source';
import { User, UserRole } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const existing = await userRepository.findOneBy({ email: 'admin@shop.com' });
  if (existing) {
    console.log('Admin already exists, skipping seed.');
    await AppDataSource.destroy();
    return;
  }

  const admin = userRepository.create({
    email: 'admin@shop.com',
    password: await bcrypt.hash('admin123', 10),
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);
  console.log('Admin created: admin@shop.com / admin123');
  await AppDataSource.destroy();
}

seed().catch(console.error);
