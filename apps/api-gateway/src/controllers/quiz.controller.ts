import { Controller, Get, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface QuizServiceGrpc {
  getQuizById(data: { id: string, userId: string }): Promise<any>;
}

@Controller('quiz')
export class QuizController implements OnModuleInit {
  private quizServiceGrpc: QuizServiceGrpc;

  constructor(
    @Inject('QUIZ_SERVICE') private readonly quizClient: ClientGrpc
  ) { }

  async onModuleInit() {
    this.quizServiceGrpc = this.quizClient.getService<QuizServiceGrpc>('QuizService');
  }

  @Get(':id')
  async getQuizById(@Param('id') id: string, @Query('userId') userId: string) {
    const result = await this.quizServiceGrpc.getQuizById({ id, userId });
    return {
      data: result,
      timestamp: new Date().toISOString()
    };
  }
} 