import { BaseChatbotDto, BaseChatbotSettingDto } from '../../base-chatbot.dto';

export class ultraaiDto extends BaseChatbotDto {
  agentUrl?: string;
  apiKey?: string;
}

export class ultraaiSettingDto extends BaseChatbotSettingDto {
  ultraaiIdFallback?: string;
}
