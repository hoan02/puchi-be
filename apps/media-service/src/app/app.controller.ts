import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @GrpcMethod('MediaService', 'UploadMedia')
  uploadMedia(data: { userId: string, fileName: string, fileData: Buffer }) {
    // Demo trả về thành công
    return {
      success: true,
      url: `https://media.example.com/${data.fileName}`,
      error: '',
    };
  }
}
