import { Controller, Get, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface VocabularyServiceGrpc {
  getVocabularyById(data: { id: string, userId: string }): Promise<any>;
}

@Controller('vocabulary')
export class VocabularyController implements OnModuleInit {
  private vocabularyServiceGrpc: VocabularyServiceGrpc;

  constructor(
    @Inject('VOCABULARY_SERVICE') private readonly vocabularyClient: ClientGrpc
  ) { }

  async onModuleInit() {
    this.vocabularyServiceGrpc = this.vocabularyClient.getService<VocabularyServiceGrpc>('VocabularyService');
  }

  @Get(':id')
  async getVocabularyById(@Param('id') id: string, @Query('userId') userId: string) {
    const result = await this.vocabularyServiceGrpc.getVocabularyById({ id, userId });
    return {
      data: result,
      timestamp: new Date().toISOString()
    };
  }
} 