import { BaseChatbotDto, BaseChatbotSettingDto } from '../../base-chatbot.dto';

export class ultralutionBotDto extends BaseChatbotDto {
  apiUrl: string;
  apiKey: string;
}

export class ultralutionBotSettingDto extends BaseChatbotSettingDto {
  botIdFallback?: string;
}
