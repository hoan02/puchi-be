import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AUDIO_CLIENT, NOTIFICATION_CLIENT, PROGRESS_CLIENT, VOCAB_CLIENT } from '../constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(PROGRESS_CLIENT) private readonly progressRMQClient: ClientProxy,
    @Inject(AUDIO_CLIENT) private readonly audioRMQClient: ClientProxy,
    @Inject(NOTIFICATION_CLIENT) private readonly notificationRMQClient: ClientProxy,
    @Inject(VOCAB_CLIENT) private readonly vocabRMQClient: ClientProxy,
  ) {

  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern("lesson-created")
  handleLessonCreated(@Payload() lesson: any) {
    console.log("Lesson created:", lesson);
    this.progressRMQClient.emit("process", lesson);
  }
}
