import { Test, TestingModule } from '@nestjs/testing';
import { ProviderHistoryService } from './provider-history.service';

describe('ProviderHistoryService', () => {
  let service: ProviderHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderHistoryService],
    }).compile();

    service = module.get<ProviderHistoryService>(ProviderHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
