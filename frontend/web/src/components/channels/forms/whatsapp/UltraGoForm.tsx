import { useLanguage } from '@/hooks/useLanguage';
import { FormField } from '../../shared/FormField';
import { FormCheckbox } from '../../shared/FormCheckbox';
import { FormSection } from '../../shared/FormSection';
import { FormData } from '@/hooks/channels/useChannelForm';
import { sanitizeInboxName } from '@/utils/sanitizeName';
import { PhoneInput } from '@/components/shared/PhoneInput';

interface UltraGoFormProps {
  form: FormData;
  onFormChange: (key: string, value: string | boolean) => void;
  hasUltraGoConfig: boolean;
}

export const UltraGoForm = ({ form, onFormChange, hasUltraGoConfig }: UltraGoFormProps) => {
  const { t } = useLanguage('whatsapp');
  const getStr = (key: string, fallback = ''): string =>
    typeof form[key] === 'string' ? (form[key] as string) : fallback;

  const handleDisplayNameChange = (value: string) => {
    onFormChange('display_name', value);
    onFormChange('name', sanitizeInboxName(value));
  };

  return (
    <div className="space-y-6">
      {/* Basic Configuration - Only show API/Token if not auto-filled */}
      {!hasUltraGoConfig && (
        <>
          <FormField
            label={t('UltraGoForm.fields.apiUrl.label')}
            value={getStr('api_url')}
            onChange={value => onFormChange('api_url', value)}
            placeholder={t('UltraGoForm.fields.apiUrl.placeholder')}
            type="url"
            required
          />

          <FormField
            label={t('UltraGoForm.fields.adminToken.label')}
            value={getStr('admin_token')}
            onChange={value => onFormChange('admin_token', value)}
            placeholder={t('UltraGoForm.fields.adminToken.placeholder')}
            type="password"
            required
          />
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tour="whatsapp-credentials">
        <FormField
          label={t('UltraGoForm.fields.displayName.label')}
          value={getStr('display_name')}
          onChange={handleDisplayNameChange}
          placeholder={t('UltraGoForm.fields.displayName.placeholder')}
          helpText={t('UltraGoForm.fields.displayName.helpText')}
          required
        />
        <FormField
          label={t('UltraGoForm.fields.channelName.label')}
          value={getStr('name')}
          onChange={value => onFormChange('name', value)}
          placeholder={t('UltraGoForm.fields.channelName.placeholder')}
          helpText={t('UltraGoForm.fields.channelName.helpText')}
          required
          readOnly
        />
      </div>

      <div>
        <label className="text-sm font-medium text-sidebar-foreground/80 block mb-1">
          {t('UltraGoForm.fields.phoneNumber.label')} <span className="text-destructive">*</span>
        </label>
        <PhoneInput
          value={getStr('phone_number')}
          onChange={value => onFormChange('phone_number', value)}
          placeholder={t('UltraGoForm.fields.phoneNumber.placeholder')}
          defaultCountry="BR"
        />
      </div>

      {/* Optional fields populated after verification */}
      {getStr('instance_uuid') && (
        <FormField
          label={t('UltraGoForm.fields.instanceUuid.label')}
          value={getStr('instance_uuid')}
          onChange={value => onFormChange('instance_uuid', value)}
          placeholder={t('UltraGoForm.fields.instanceUuid.placeholder')}
          readOnly
        />
      )}

      {getStr('instance_token') && (
        <FormField
          label={t('UltraGoForm.fields.instanceToken.label')}
          value={getStr('instance_token')}
          onChange={value => onFormChange('instance_token', value)}
          placeholder={t('UltraGoForm.fields.instanceToken.placeholder')}
          type="password"
          readOnly
        />
      )}

      {/* Advanced Settings - Ultra Go */}
      <FormSection
        title={t('UltraGoForm.sections.instance.title')}
        className="bg-gray-50/10 border-gray-200/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Always Online */}
          <FormCheckbox
            label={t('UltraGoForm.sections.instance.alwaysOnline')}
            checked={!!form.alwaysOnline}
            onChange={checked => onFormChange('alwaysOnline', checked)}
          />

          {/* Reject Call */}
          <FormCheckbox
            label={t('UltraGoForm.sections.instance.rejectCall')}
            checked={!!form.rejectCall}
            onChange={checked => onFormChange('rejectCall', checked)}
          />

          {/* Read Messages */}
          <FormCheckbox
            label={t('UltraGoForm.sections.instance.readMessages')}
            checked={!!form.readMessages}
            onChange={checked => onFormChange('readMessages', checked)}
          />

          {/* Ignore Groups */}
          <FormCheckbox
            label={t('UltraGoForm.sections.instance.ignoreGroups')}
            checked={!!form.ignoreGroups}
            onChange={checked => onFormChange('ignoreGroups', checked)}
          />

          {/* Ignore Status */}
          <div className="md:col-span-2">
            <FormCheckbox
              label={t('UltraGoForm.sections.instance.ignoreStatus')}
              checked={!!form.ignoreStatus}
              onChange={checked => onFormChange('ignoreStatus', checked)}
            />
          </div>
        </div>
      </FormSection>

      {/* Help Section */}
      <FormSection
        title={t('UltraGoForm.help.title')}
        className="bg-green-50/10 border-green-200/20"
        data-tour="whatsapp-help"
      >
        <div className="text-sm text-sidebar-foreground/70 space-y-2">
          <p><strong>{t('UltraGoForm.help.performance.title')}:</strong> {t('UltraGoForm.help.performance.description')}</p>
          <p><strong>{t('UltraGoForm.help.stability.title')}:</strong> {t('UltraGoForm.help.stability.description')}</p>
          <p><strong>{t('UltraGoForm.help.features.title')}:</strong> {t('UltraGoForm.help.features.description')}</p>
          <p><strong>{t('UltraGoForm.help.uuidToken.title')}:</strong> {t('UltraGoForm.help.uuidToken.description')}</p>
        </div>
      </FormSection>
    </div>
  );
};
