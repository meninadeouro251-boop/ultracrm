import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '@/components/shared/forms';
import type { IntegrationFormProps } from '@/types/integrations/forms';

export function UltraForm({ config, onConfigChange }: IntegrationFormProps) {
  const { t } = useLanguage('integrations');

  const getValue = (key: string, defaultValue = '') => {
    const value = config[key];
    return typeof value === 'string' ? value : defaultValue;
  };

  return (
    <div className="space-y-4">
      <FormField
        id="Ultra_API_URL"
        label={t('integrations.Ultra.apiUrl')}
        value={getValue('UltraApiUrl')}
        onChange={(value) => onConfigChange('UltraApiUrl', value)}
        placeholder={t('integrations.Ultra.placeholders.apiUrl')}
        type="url"
      />
      <FormField
        id="Ultra_ADMIN_TOKEN"
        label={t('integrations.Ultra.adminToken')}
        value={getValue('UltraAdminToken')}
        onChange={(value) => onConfigChange('UltraAdminToken', value)}
        placeholder={t('integrations.Ultra.placeholders.adminToken')}
        type="password"
      />
    </div>
  );
}

