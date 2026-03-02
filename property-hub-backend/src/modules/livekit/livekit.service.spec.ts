import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LivekitService } from './livekit.service';

describe('LivekitService', () => {
    let service: LivekitService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LivekitService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'LIVEKIT_API_KEY') return 'test-key';
                            if (key === 'LIVEKIT_API_SECRET') return 'test-secret';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<LivekitService>(LivekitService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate a token', async () => {
        const token = await service.generateToken('test-room', 'test-participant');
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
    });
});
