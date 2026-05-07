import { InstanceDto } from '@api/dto/instance.dto';
import { ultraaiDto } from '@api/integrations/chatbot/ultraai/dto/ultraai.dto';
import { ultraaiService } from '@api/integrations/chatbot/ultraai/services/ultraai.service';
import { PrismaRepository } from '@api/repository/repository.service';
import { WAMonitoringService } from '@api/services/monitor.service';
import { configService, ultraai } from '@config/env.config';
import { Logger } from '@config/logger.config';
import { BadRequestException } from '@exceptions';
import { ultraai as ultraaiModel, IntegrationSession } from '@prisma/client';

import { BaseChatbotController } from '../../base-chatbot.controller';

export class ultraaiController extends BaseChatbotController<ultraaiModel, ultraaiDto> {
  constructor(
    private readonly ultraaiService: ultraaiService,
    prismaRepository: PrismaRepository,
    waMonitor: WAMonitoringService,
  ) {
    super(prismaRepository, waMonitor);

    this.botRepository = this.prismaRepository.ultraai;
    this.settingsRepository = this.prismaRepository.ultraaiSetting;
    this.sessionRepository = this.prismaRepository.integrationSession;
  }

  public readonly logger = new Logger('ultraaiController');
  protected readonly integrationName = 'ultraai';

  integrationEnabled = configService.get<ultraai>('ultraAI').ENABLED;
  botRepository: any;
  settingsRepository: any;
  sessionRepository: any;
  userMessageDebounce: { [key: string]: { message: string; timeoutId: NodeJS.Timeout } } = {};

  protected getFallbackBotId(settings: any): string | undefined {
    return settings?.ultraaiIdFallback;
  }

  protected getFallbackFieldName(): string {
    return 'ultraaiIdFallback';
  }

  protected getIntegrationType(): string {
    return 'ultraai';
  }

  protected getAdditionalBotData(data: ultraaiDto): Record<string, any> {
    return {
      agentUrl: data.agentUrl,
      apiKey: data.apiKey,
    };
  }

  // Implementation for bot-specific updates
  protected getAdditionalUpdateFields(data: ultraaiDto): Record<string, any> {
    return {
      agentUrl: data.agentUrl,
      apiKey: data.apiKey,
    };
  }

  // Implementation for bot-specific duplicate validation on update
  protected async validateNoDuplicatesOnUpdate(botId: string, instanceId: string, data: ultraaiDto): Promise<void> {
    const checkDuplicate = await this.botRepository.findFirst({
      where: {
        id: {
          not: botId,
        },
        instanceId: instanceId,
        agentUrl: data.agentUrl,
        apiKey: data.apiKey,
      },
    });

    if (checkDuplicate) {
      throw new Error('ultraai already exists');
    }
  }

  // Override createBot to add ultraAI-specific validation
  public async createBot(instance: InstanceDto, data: ultraaiDto) {
    if (!this.integrationEnabled) throw new BadRequestException('ultraai is disabled');

    const instanceId = await this.prismaRepository.instance
      .findFirst({
        where: {
          name: instance.instanceName,
        },
      })
      .then((instance) => instance.id);

    // ultraAI-specific duplicate check
    const checkDuplicate = await this.botRepository.findFirst({
      where: {
        instanceId: instanceId,
        agentUrl: data.agentUrl,
        apiKey: data.apiKey,
      },
    });

    if (checkDuplicate) {
      throw new Error('ultraai already exists');
    }

    // Let the base class handle the rest
    return super.createBot(instance, data);
  }

  // Process ultraai-specific bot logic
  protected async processBot(
    instance: any,
    remoteJid: string,
    bot: ultraaiModel,
    session: IntegrationSession,
    settings: any,
    content: string,
    pushName?: string,
    msg?: any,
  ) {
    await this.ultraaiService.process(instance, remoteJid, bot, session, settings, content, pushName, msg);
  }
}
