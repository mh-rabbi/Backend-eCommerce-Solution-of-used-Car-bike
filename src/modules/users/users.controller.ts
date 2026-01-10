import { 
  Controller, 
  Get, 
  Put, 
  Post,
  Body, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {
    // Ensure profile-images directory exists
    const uploadDir = join(process.cwd(), 'uploads', 'profile-images');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findOne(user.id);
    if (!fullUser) {
      throw new BadRequestException('User not found');
    }
    // Return user without password
    const { password, ...result } = fullUser;
    return result;
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: {
      name?: string;
      email?: string;
      address?: string;
      streetNo?: string;
      postalCode?: string;
      phone?: string;
    },
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, updateData);
    // Return user without password
    const { password, ...result } = updatedUser;
    return result;
  }

  @Post('profile/upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'profile-images');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadProfileImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const imageUrl = `/uploads/profile-images/${file.filename}`;
    const updatedUser = await this.usersService.updateProfileImage(user.id, imageUrl);
    
    // Return user without password
    const { password, ...result } = updatedUser;
    return {
      ...result,
      imageUrl,
    };
  }
}

