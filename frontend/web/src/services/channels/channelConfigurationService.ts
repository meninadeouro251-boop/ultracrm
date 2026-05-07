import api from '@/services/core/api';
import type { ChannelConfiguration, UltraSettings } from '@/types/channels/inbox';

const ChannelConfigurationService = {
  /**
   * Update channel configuration
   */
  async updateConfiguration(inboxId: string, configuration: ChannelConfiguration): Promise<any> {
    try {
      const payload = {
        id: inboxId,
        formData: false,
        channel: configuration,
      };

      const { data } = await api.patch(`/inboxes/${inboxId}`, payload);
      return data;
    } catch (error) {
      console.error('ChannelConfigurationService.updateConfiguration error:', error);
      throw error;
    }
  },

  /**
   * Update IMAP configuration specifically
   */
  async updateIMAPConfiguration(
    inboxId: string,
    imapConfig: Partial<ChannelConfiguration>,
  ): Promise<any> {
    try {
      const payload = {
        id: inboxId,
        formData: false,
        channel: imapConfig,
      };

      // Use specific IMAP update endpoint if available
      const { data } = await api.patch(`/inboxes/${inboxId}/imap`, payload);
      return data;
    } catch (error) {
      console.error('ChannelConfigurationService.updateIMAPConfiguration error:', error);
      // Fallback to regular update if specific endpoint doesn't exist
      return this.updateConfiguration(inboxId, imapConfig);
    }
  },

  /**
   * Set up channel provider (for channels that need setup)
   */
  async setupChannelProvider(inboxId: string): Promise<any> {
    try {
      const { data } = await api.post(`/inboxes/${inboxId}/setup_channel_provider`);
      return data;
    } catch (error) {
      console.error('ChannelConfigurationService.setupChannelProvider error:', error);
      throw error;
    }
  },

  /**
   * Disconnect channel provider
   */
  async disconnectChannelProvider(inboxId: string): Promise<any> {
    try {
      const { data } = await api.post(`/inboxes/${inboxId}/disconnect_channel_provider`);
      return data;
    } catch (error) {
      console.error('ChannelConfigurationService.disconnectChannelProvider error:', error);
      throw error;
    }
  },
};

/**
 * Ultra API Service (specific for Ultra WhatsApp provider)
 */
export const UltraApiService = {
  /**
   * Verify Ultra connection
   */
  async verifyConnection(config: UltraSettings): Promise<any> {
    try {
      const { data } = await api.post(`/ultra/authorization`, {
        authorization: {
          api_url: config.api_url,
          admin_token: config.admin_token,
          instance_name: config.instance_name,
          phone_number: config.phone_number,
          proxy_settings: config.proxy_settings,
          instance_settings: config.instance_settings,
        },
      });
      return data;
    } catch (error) {
      console.error('UltraApiService.verifyConnection error:', error);
      throw error;
    }
  },

  /**
   * Get QR Code for Ultra instance
   */
  async getQRCode(instanceName: string, provider: string = 'ultra'): Promise<any> {
    try {
      // Use different endpoint for Ultra Go
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/qrcodes/${instanceName}`
          : `/ultra/qrcodes/${instanceName}`;

      const { data } = await api.get(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.getQRCode error:', error);
      throw error;
    }
  },

  /**
   * Refresh QR Code for Ultra instance
   */
  async refreshQRCode(config: {
    apiUrl: string;
    apiHash: string;
    instanceName: string;
  }): Promise<any> {
    try {
      const { data } = await api.post(`/ultra/qrcodes`, {
        api_url: config.apiUrl,
        api_hash: config.apiHash,
        instance_name: config.instanceName,
      });
      return data;
    } catch (error) {
      console.error('UltraApiService.refreshQRCode error:', error);
      throw error;
    }
  },

  /**
   * Get Ultra instance settings
   */
  async getSettings(instanceName: string, provider: string = 'ultra'): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/settings/${instanceName}`
          : `/ultra/settings/${instanceName}`;

      const { data } = await api.get(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.getSettings error:', error);
      throw error;
    }
  },

  /**
   * Update Ultra instance settings
   */
  async updateSettings(
    instanceName: string,
    settings: UltraSettings['instance_settings'],
    provider: string = 'ultra',
  ): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/settings/${instanceName}`
          : `/ultra/settings/${instanceName}`;

      const { data } = await api.put(endpoint, {
        settings,
      });
      return data;
    } catch (error) {
      console.error('UltraApiService.updateSettings error:', error);
      throw error;
    }
  },

  /**
   * Get Ultra proxy settings
   */
  async getProxy(instanceName: string): Promise<any> {
    try {
      const { data } = await api.get(`/ultra/proxies/${instanceName}`);
      return data;
    } catch (error) {
      console.error('UltraApiService.getProxy error:', error);
      throw error;
    }
  },

  /**
   * Update Ultra proxy settings
   */
  async updateProxy(
    instanceName: string,
    proxySettings: UltraSettings['proxy_settings'],
  ): Promise<any> {
    try {
      const { data } = await api.put(`/ultra/proxies/${instanceName}`, {
        proxy_settings: proxySettings,
      });
      return data;
    } catch (error) {
      console.error('UltraApiService.updateProxy error:', error);
      throw error;
    }
  },

  /**
   * Get Ultra instances
   */
  async getInstances(instanceName?: string, provider: string = 'ultra'): Promise<any> {
    try {
      let endpoint: string;

      if (provider === 'ultra_go') {
        // Ultra Go uses /authorization/fetch endpoint
        endpoint = `/ultra_go/authorization/fetch`;
        if (instanceName) {
          endpoint += `?instanceName=${instanceName}`;
        }
      } else {
        // Ultra uses /instances endpoint
        const params = instanceName ? `?instanceName=${instanceName}` : '';
        endpoint = `/ultra/instances${params}`;
      }

      const { data } = await api.get(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.getInstances error:', error);
      throw error;
    }
  },

  /**
   * Logout Ultra instance
   */
  async logout(instanceName: string, provider: string = 'ultra'): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/authorization/logout?instanceName=${instanceName}`
          : `/ultra/instances/${instanceName}/logout`;

      const { data } = await api.delete(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.logout error:', error);
      throw error;
    }
  },

  /**
   * Get current profile settings for Ultra Go instance
   */
  async getProfile(instanceName: string, provider: string = 'ultra'): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/profile/${instanceName}`
          : `/ultra/profile/${instanceName}`;

      const { data } = await api.get(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.getProfile error:', error);
      throw error;
    }
  },

  /**
   * Fetch profile data for Ultra instance
   */
  async fetchProfile(
    instanceName: string,
    phoneNumber: string,
    provider: string = 'ultra',
  ): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/profile/${instanceName}/fetch`
          : `/ultra/profile/${instanceName}/fetch`;

      const { data } = await api.post(endpoint, { number: phoneNumber });
      return data;
    } catch (error) {
      console.error('UltraApiService.fetchProfile error:', error);
      throw error;
    }
  },

  /**
   * Update profile name for Ultra instance
   */
  async updateProfileName(
    instanceName: string,
    name: string,
    provider: string = 'ultra',
  ): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/profile/${instanceName}/name`
          : `/ultra/profile/${instanceName}/name`;

      const { data } = await api.post(endpoint, { name });
      return data;
    } catch (error) {
      console.error('UltraApiService.updateProfileName error:', error);
      throw error;
    }
  },

  /**
   * Update profile status (description) for Ultra instance
   */
  async updateProfileStatus(
    instanceName: string,
    status: string,
    provider: string = 'ultra',
  ): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/profile/${instanceName}/status`
          : `/ultra/profile/${instanceName}/status`;

      const { data } = await api.post(endpoint, { status });
      return data;
    } catch (error) {
      console.error('UltraApiService.updateProfileStatus error:', error);
      throw error;
    }
  },

  /**
   * Update profile picture for Ultra instance
   */
  async updateProfilePicture(
    instanceName: string,
    pictureUrl: string,
    provider: string = 'ultra',
  ): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/profile/${instanceName}/picture`
          : `/ultra/profile/${instanceName}/picture`;

      const { data } = await api.post(endpoint, { picture: pictureUrl });
      return data;
    } catch (error) {
      console.error('UltraApiService.updateProfilePicture error:', error);
      throw error;
    }
  },

  /**
   * Remove profile picture for Ultra instance
   */
  async removeProfilePicture(instanceName: string, provider: string = 'ultra'): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/profile/${instanceName}/picture`
          : `/ultra/profile/${instanceName}/picture`;

      const { data } = await api.delete(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.removeProfilePicture error:', error);
      throw error;
    }
  },

  /**
   * Fetch privacy settings for Ultra instance
   */
  async fetchPrivacySettings(instanceName: string, provider: string = 'ultra'): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/privacy/${instanceName}`
          : `/ultra/privacy/${instanceName}`;

      const { data } = await api.get(endpoint);
      return data;
    } catch (error) {
      console.error('UltraApiService.fetchPrivacySettings error:', error);
      throw error;
    }
  },

  /**
   * Update privacy settings for Ultra instance
   */
  async updatePrivacySettings(
    instanceName: string,
    privacySettings: {
      readreceipts?: string;
      profile?: string;
      status?: string;
      online?: string;
      last?: string;
      groupadd?: string;
      readReceipts?: string;
      groupAdd?: string;
      lastSeen?: string;
      callAdd?: string;
    },
    provider: string = 'ultra',
  ): Promise<any> {
    try {
      const endpoint =
        provider === 'ultra_go'
          ? `/ultra_go/privacy/${instanceName}`
          : `/ultra/privacy/${instanceName}`;

      const { data } = await api.put(endpoint, { privacy: privacySettings });
      return data;
    } catch (error) {
      console.error('UltraApiService.updatePrivacySettings error:', error);
      throw error;
    }
  },
};

/**
 * Z-API Service (specific for Z-API WhatsApp provider)
 */
export const ZapiService = {
  /**
   * Upload file and get URL
   */
  async uploadFile(file: File): Promise<{ file_url: string; blob_key: string }> {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const { data } = await api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      console.error('ZapiService.uploadFile error:', error);
      throw error;
    }
  },

  /**
   * Get QR Code for Z-API instance
   */
  async getQRCode(instanceId: string): Promise<any> {
    try {
      const { data } = await api.get(`/zapi/qrcodes/${instanceId}`);
      return data;
    } catch (error) {
      console.error('ZapiService.getQRCode error:', error);
      throw error;
    }
  },

  /**
   * Refresh QR Code for Z-API instance
   */
  async refreshQRCode(instanceId: string): Promise<any> {
    try {
      const { data } = await api.post(`/zapi/qrcodes/${instanceId}`);
      return data;
    } catch (error) {
      console.error('ZapiService.refreshQRCode error:', error);
      throw error;
    }
  },

  /**
   * Get Z-API instance status
   */
  async getStatus(instanceId: string): Promise<any> {
    try {
      const { data } = await api.get(`/zapi/qrcodes/status?instance_id=${instanceId}`);
      return data;
    } catch (error) {
      console.error('ZapiService.getStatus error:', error);
      throw error;
    }
  },

  /**
   * Get Z-API instance data (status, device, instance info)
   */
  async getInstanceData(instanceId: string): Promise<any> {
    try {
      const { data } = await api.get(`/zapi/settings/${instanceId}`);
      return data;
    } catch (error) {
      console.error('ZapiService.getInstanceData error:', error);
      throw error;
    }
  },

  /**
   * Update Z-API profile picture
   */
  async updateProfilePicture(instanceId: string, imageUrl: string): Promise<any> {
    try {
      const { data } = await api.put(`/zapi/settings/${instanceId}/profile-picture`, {
        value: imageUrl,
      });
      return data;
    } catch (error) {
      console.error('ZapiService.updateProfilePicture error:', error);
      throw error;
    }
  },

  /**
   * Update Z-API instance name
   */
  async updateInstanceName(instanceId: string, name: string): Promise<any> {
    try {
      const { data } = await api.put(`/zapi/settings/${instanceId}/update-instance-name`, {
        value: name,
      });
      return data;
    } catch (error) {
      console.error('ZapiService.updateInstanceName error:', error);
      throw error;
    }
  },

  /**
   * Update Z-API profile name
   */
  async updateProfileName(instanceId: string, name: string): Promise<any> {
    try {
      const { data } = await api.put(`/zapi/settings/${instanceId}/update_profile_name`, {
        name,
      });
      return data;
    } catch (error) {
      console.error('ZapiService.updateProfileName error:', error);
      throw error;
    }
  },

  /**
   * Update Z-API profile description
   */
  async updateProfileDescription(instanceId: string, description: string): Promise<any> {
    try {
      const { data } = await api.put(`/zapi/settings/${instanceId}/update_profile_description`, {
        description,
      });
      return data;
    } catch (error) {
      console.error('ZapiService.updateProfileDescription error:', error);
      throw error;
    }
  },

  /**
   * Update Z-API call reject setting
   */
  async updateCallReject(instanceId: string, reject: boolean): Promise<any> {
    try {
      const { data } = await api.put(`/zapi/settings/${instanceId}/update_call_reject`, {
        reject,
      });
      return data;
    } catch (error) {
      console.error('ZapiService.updateCallReject error:', error);
      throw error;
    }
  },

  /**
   * Update Z-API call reject message
   */
  async updateCallRejectMessage(instanceId: string, message: string): Promise<any> {
    try {
      const { data } = await api.put(`/zapi/settings/${instanceId}/update_call_reject_message`, {
        message,
      });
      return data;
    } catch (error) {
      console.error('ZapiService.updateCallRejectMessage error:', error);
      throw error;
    }
  },

  /**
   * Restart Z-API instance
   */
  async restartInstance(instanceId: string): Promise<any> {
    try {
      const { data } = await api.post(`/zapi/settings/${instanceId}/restart`);
      return data;
    } catch (error) {
      console.error('ZapiService.restartInstance error:', error);
      throw error;
    }
  },

  /**
   * Disconnect Z-API instance
   */
  async disconnectInstance(instanceId: string): Promise<any> {
    try {
      const { data } = await api.post(`/zapi/settings/${instanceId}/disconnect`);
      return data;
    } catch (error) {
      console.error('ZapiService.disconnectInstance error:', error);
      throw error;
    }
  },

  /**
   * Get disallowed contacts for privacy settings
   */
  async getDisallowedContacts(instanceId: string, type: string): Promise<any> {
    try {
      const { data } = await api.get(
        `/zapi/settings/${instanceId}/privacy_disallowed_contacts?type=${type}`,
      );
      return data;
    } catch (error) {
      console.error('ZapiService.getDisallowedContacts error:', error);
      throw error;
    }
  },

  /**
   * Set last seen privacy
   */
  async setLastSeen(
    instanceId: string,
    visualizationType: string,
    contactsBlacklist?: any[],
  ): Promise<any> {
    try {
      const payload: any = { visualizationType };
      if (contactsBlacklist) {
        payload.contactsBlacklist = contactsBlacklist;
      }
      const { data } = await api.post(
        `/zapi/settings/${instanceId}/privacy_set_last_seen`,
        payload,
      );
      return data;
    } catch (error) {
      console.error('ZapiService.setLastSeen error:', error);
      throw error;
    }
  },

  /**
   * Set photo visualization privacy
   */
  async setPhotoVisualization(
    instanceId: string,
    visualizationType: string,
    contactsBlacklist?: any[],
  ): Promise<any> {
    try {
      const payload: any = { visualizationType };
      if (contactsBlacklist) {
        payload.contactsBlacklist = contactsBlacklist;
      }
      const { data } = await api.post(
        `/zapi/settings/${instanceId}/privacy_set_photo_visualization`,
        payload,
      );
      return data;
    } catch (error) {
      console.error('ZapiService.setPhotoVisualization error:', error);
      throw error;
    }
  },

  /**
   * Set description privacy
   */
  async setDescription(
    instanceId: string,
    visualizationType: string,
    contactsBlacklist?: any[],
  ): Promise<any> {
    try {
      const payload: any = { visualizationType };
      if (contactsBlacklist) {
        payload.contactsBlacklist = contactsBlacklist;
      }
      const { data } = await api.post(
        `/zapi/settings/${instanceId}/privacy_set_description`,
        payload,
      );
      return data;
    } catch (error) {
      console.error('ZapiService.setDescription error:', error);
      throw error;
    }
  },

  /**
   * Set group add permission privacy
   */
  async setGroupAddPermission(
    instanceId: string,
    visualizationType: string,
    contactsBlacklist?: any[],
  ): Promise<any> {
    try {
      const payload: any = { visualizationType };
      if (contactsBlacklist) {
        payload.contactsBlacklist = contactsBlacklist;
      }
      const { data } = await api.post(
        `/zapi/settings/${instanceId}/privacy_set_group_add_permission`,
        payload,
      );
      return data;
    } catch (error) {
      console.error('ZapiService.setGroupAddPermission error:', error);
      throw error;
    }
  },

  /**
   * Set online privacy
   */
  async setOnline(
    instanceId: string,
    visualizationType: string,
    contactsBlacklist?: any[],
  ): Promise<any> {
    try {
      const payload: any = { visualizationType };
      if (contactsBlacklist) {
        payload.contactsBlacklist = contactsBlacklist;
      }
      const { data } = await api.post(`/zapi/settings/${instanceId}/privacy_set_online`, payload);
      return data;
    } catch (error) {
      console.error('ZapiService.setOnline error:', error);
      throw error;
    }
  },

  /**
   * Set read receipts privacy
   */
  async setReadReceipts(
    instanceId: string,
    visualizationType: string,
    contactsBlacklist?: any[],
  ): Promise<any> {
    try {
      const payload: any = { visualizationType };
      if (contactsBlacklist) {
        payload.contactsBlacklist = contactsBlacklist;
      }
      const { data } = await api.post(
        `/zapi/settings/${instanceId}/privacy_set_read_receipts`,
        payload,
      );
      return data;
    } catch (error) {
      console.error('ZapiService.setReadReceipts error:', error);
      throw error;
    }
  },

  /**
   * Set messages duration privacy
   */
  async setMessagesDuration(instanceId: string, duration: number): Promise<any> {
    try {
      const { data } = await api.post(
        `/zapi/settings/${instanceId}/privacy_set_messages_duration`,
        {
          duration,
        },
      );
      return data;
    } catch (error) {
      console.error('ZapiService.setMessagesDuration error:', error);
      throw error;
    }
  },
};

export default ChannelConfigurationService;
