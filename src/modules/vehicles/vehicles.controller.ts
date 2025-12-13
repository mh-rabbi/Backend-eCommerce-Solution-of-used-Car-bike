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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { VehicleStatus } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createVehicleDto: CreateVehicleDto, @CurrentUser() user: any) {
    try {
      console.log('Creating vehicle for user:', user);
      console.log('Vehicle data:', JSON.stringify(createVehicleDto, null, 2));
      
      if (!user || !user.id) {
        console.error('User information not available');
        throw new UnauthorizedException('User information not available');
      }
      
      const vehicle = await this.vehiclesService.create(createVehicleDto, user.id);
      console.log('Vehicle created successfully with ID:', vehicle.id);
      return vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw error;
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
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('File upload attempt:', file.originalname, file.mimetype);
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          console.error('Invalid file type:', file.mimetype);
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      console.log('Upload request received. Files count:', files?.length || 0);
      
      if (!files || files.length === 0) {
        console.error('No files received');
        throw new Error('No files uploaded');
      }
      
      const imageUrls = files.map((file) => {
        console.log('File uploaded:', file.filename);
        return `/uploads/${file.filename}`;
      });
      
      console.log('Upload successful. Image URLs:', imageUrls);
      return { images: imageUrls };
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }
}

