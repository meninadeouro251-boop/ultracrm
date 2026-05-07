import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function UltraGoForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="Ultra_GO_API_URL"
        label={t('integrations.UltraGo.apiUrl')}
        value={getValue('UltraGoApiUrl')}
        onChange={(value) => onConfigChange('UltraGoApiUrl', value)}
        placeholder={t('integrations.UltraGo.placeholders.apiUrl')}
        type="url"
      />
      <FormField
        id="Ultra_GO_ADMIN_TOKEN"
        label={t('integrations.UltraGo.adminToken')}
        value={getValue('UltraGoAdminToken')}
        onChange={(value) => onConfigChange('UltraGoAdminToken', value)}
        placeholder={t('integrations.UltraGo.placeholders.adminToken')}
        type="password"
      />
      <FormField
        id="Ultra_GO_INSTANCE_ID"
        label={t('integrations.UltraGo.instanceId')}
        value={getValue('UltraGoInstanceId')}
        onChange={(value) => onConfigChange('UltraGoInstanceId', value)}
        placeholder={t('integrations.UltraGo.placeholders.instanceId')}
      />
      <FormField
        id="Ultra_GO_INSTANCE_TOKEN"
        label={t('integrations.UltraGo.instanceToken')}
        value={getValue('UltraGoInstanceToken')}
        onChange={(value) => onConfigChange('UltraGoInstanceToken', value)}
        placeholder={t('integrations.UltraGo.placeholders.instanceToken')}
        type="password"
      />
    </div>
  );
}

