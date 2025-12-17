import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { VehicleStatus } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {
    // CRITICAL FIX: Ensure uploads directory exists on startup
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      console.log('📁 Creating uploads directory:', uploadDir);
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createVehicleDto: CreateVehicleDto, @CurrentUser() user: any) {
    try {
      console.log('=== Creating Vehicle ===');
      console.log('User from token:', JSON.stringify(user, null, 2));
      console.log('Vehicle data:', JSON.stringify(createVehicleDto, null, 2));
      
      // CRITICAL FIX: Validate user object
      if (!user || !user.id) {
        console.error('❌ User information not available in request');
        throw new UnauthorizedException('User authentication failed. Please login again.');
      }

      // CRITICAL FIX: Validate vehicle data
      if (!createVehicleDto.title || !createVehicleDto.brand || !createVehicleDto.type) {
        throw new BadRequestException('Missing required vehicle information');
      }
      
      const vehicle = await this.vehiclesService.create(createVehicleDto, user.id);
      console.log('✅ Vehicle created successfully with ID:', vehicle.id);
      
      return vehicle;
    } catch (error) {
      console.error('❌ Error creating vehicle:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to create vehicle: ${error.message}`);
    }
  }

  @Get()
  async findAll(@Query('status') status?: VehicleStatus) {
    if (status) {
      return this.vehiclesService.findAll(status);
    }
    return this.vehiclesService.getApprovedVehicles();
  }

  @Get('my-vehicles')
  @UseGuards(JwtAuthGuard)
  async getMyVehicles(@CurrentUser() user: any) {
    console.log('Fetching vehicles for user:', user.id);
    return this.vehiclesService.findBySeller(user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Put(':id/sold')
  @UseGuards(JwtAuthGuard)
  async markAsSold(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.vehiclesService.markAsSold(id, user.id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          // CRITICAL FIX: Ensure directory exists before saving
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // CRITICAL FIX: Better filename generation with timestamp
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          cb(null, `vehicle-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('📸 File upload attempt:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        
        // CRITICAL FIX: More permissive image validation
        const allowedMimes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (allowedMimes.includes(file.mimetype.toLowerCase())) {
          cb(null, true);
        } else {
          console.error('❌ Invalid file type:', file.mimetype);
          cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
      },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any
  ) {
    try {
      console.log('=== Image Upload Request ===');
      console.log('User:', user?.id || 'No user');
      console.log('Files count:', files?.length || 0);
      
      // CRITICAL FIX: Validate user
      if (!user || !user.id) {
        console.error('❌ User not authenticated');
        throw new UnauthorizedException('Authentication required');
      }
      
      // CRITICAL FIX: Validate files
      if (!files || files.length === 0) {
        console.error('❌ No files received in request');
        throw new BadRequestException('No files uploaded. Please select images.');
      }
      
      const imageUrls = files.map((file) => {
        const url = `/uploads/${file.filename}`;
        console.log('✅ File uploaded:', {
          filename: file.filename,
          url: url,
          size: file.size,
          mimetype: file.mimetype
        });
        return url;
      });
      
      console.log('✅ All images uploaded successfully');
      console.log('Image URLs:', imageUrls);
      
      return { 
        success: true,
        images: imageUrls,
        count: imageUrls.length
      };
    } catch (error) {
      console.error('❌ Error uploading images:', error.message);
      console.error('Error details:', error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Image upload failed: ${error.message}`);
    }
  }
}