import { faker } from '@faker-js/faker';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class UserFactory {
  static async create(userData?: Partial<User>): Promise<User> {
    const user = new User();
    const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = userData?.name || faker.person.fullName();
    user.email = userData?.email || faker.internet.email();
    user.password = userData?.password || hashedPassword;
    user.role = userData?.role || (Math.random() > 0.9 ? UserRole.ADMIN : UserRole.USER);
    user.profileImage = userData?.profileImage || faker.image.avatar();
    user.address = userData?.address || faker.location.streetAddress();
    user.streetNo = userData?.streetNo || faker.location.buildingNumber();
    user.postalCode = userData?.postalCode || faker.string.numeric(4);
    user.phone = userData?.phone || `01${faker.string.numeric(9)}`;

    return user;
  }

  static async createMany(count: number, userData?: Partial<User>): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create(userData);
      users.push(user);
    }
    return users;
  }
}
