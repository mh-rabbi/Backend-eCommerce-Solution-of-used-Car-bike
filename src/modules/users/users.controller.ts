import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

// Define upload directory path
const getUploadDir = () => {
  const uploadDir = join(process.cwd(), 'uploads', 'profile-images');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {
    // Ensure profile-images directory exists on startup
    getUploadDir();
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    console.log('📥 GET /users/profile - User:', user?.id);
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
    @Body() updateData: UpdateProfileDto,
  ) {
    console.log('📥 PUT /users/profile - User:', user?.id, 'Data:', updateData);
    const updatedUser = await this.usersService.updateProfile(user.id, updateData);
    // Return user without password
    const { password, ...result } = updatedUser;
    return result;
  }

  @Post('profile/upload-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = getUploadDir();
          console.log('📁 Upload destination:', uploadDir);
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          const filename = `profile-${uniqueSuffix}${ext}`;
          console.log('📄 Generated filename:', filename);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('🔍 File filter - mimetype:', file.mimetype, 'originalname:', file.originalname);
        // Accept common image types
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          console.log('❌ File rejected - invalid mimetype:', file.mimetype);
          cb(new BadRequestException(`Only image files are allowed. Received: ${file.mimetype}`), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadProfileImage(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
  ) {
    console.log('📥 POST /users/profile/upload-image - User:', user?.id);
    console.log('📄 Received file:', file ? { filename: file.filename, size: file.size, mimetype: file.mimetype } : 'No file');
    
    if (!file) {
      console.log('❌ No file uploaded');
      throw new BadRequestException('No image file provided. Please select an image to upload.');
    }

    const imageUrl = `/uploads/profile-images/${file.filename}`;
    console.log('✅ Image URL:', imageUrl);
    
    const updatedUser = await this.usersService.updateProfileImage(user.id, imageUrl);
    
    // Return user without password
    const { password, ...result } = updatedUser;
    return {
      ...result,
      imageUrl,
    };
  }
}

