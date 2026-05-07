import { useLanguage } from '@/hooks/useLanguage';
import { CloudWhatsappForm } from './CloudWhatsappForm';
import { TwilioWhatsappForm } from './TwilioWhatsappForm';
import { NotificameForm } from './NotificameForm';
import { ZapiForm } from './ZapiForm';
import { UltraForm } from './UltraForm';
import { UltraGoForm } from './UltraGoForm';
import { FormData } from '@/hooks/channels/useChannelForm';
import { Provider as ProviderType } from '@/components/channels/ProviderGrid';

interface WhatsappFormsProps {
  selectedProvider: ProviderType;
  form: FormData;
  onFormChange: (key: string, value: string | boolean) => void;
  hasUltraConfig: boolean;
  hasUltraGoConfig: boolean;
  canFB: boolean;
  onWhatsappCloudSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export const WhatsappForms = ({
  selectedProvider,
  form,
  onFormChange,
  hasUltraConfig,
  hasUltraGoConfig,
  canFB,
}: WhatsappFormsProps) => {
  const { t } = useLanguage('whatsapp');
  switch (selectedProvider.id) {
    case 'whatsapp_cloud':
      return <CloudWhatsappForm form={form} onFormChange={onFormChange} canFB={canFB} />;

    case 'twilio':
      return <TwilioWhatsappForm form={form} onFormChange={onFormChange} />;

    case 'notificame':
      return <NotificameForm form={form} onFormChange={onFormChange} />;

    case 'zapi':
      return <ZapiForm form={form} onFormChange={onFormChange} />;

    case 'ultra':
      return (
        <UltraForm
          form={form}
          onFormChange={onFormChange}
          hasUltraConfig={hasUltraConfig}
        />
      );

    case 'ultra_go':
      return (
        <UltraGoForm
          form={form}
          onFormChange={onFormChange}
          hasUltraGoConfig={hasUltraGoConfig}
        />
      );

    default:
      return (
        <div className="text-center py-8">
          <p className="text-sidebar-foreground/70">
            {t('errors.providerNotImplemented', { provider: selectedProvider.name })}
          </p>
        </div>
      );
  }
};
