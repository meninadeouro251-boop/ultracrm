import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import ChannelConfig from './ChannelConfig';

// Radix UI Tabs uses ResizeObserver internally
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
  } as unknown as typeof ResizeObserver;
});

const stableT = (key: string) => key;

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: stableT,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockGetConfig = vi.fn();
const mockSaveConfig = vi.fn();

vi.mock('@/services/admin/adminConfigService', () => ({
  adminConfigService: {
    getConfig: (...args: unknown[]) => mockGetConfig(...args),
    saveConfig: (...args: unknown[]) => mockSaveConfig(...args),
  },
}));

vi.mock('@/utils/apiHelpers', () => ({
  extractError: () => ({ message: 'Test error' }),
}));

const EMPTY_FACEBOOK = {
  FB_APP_ID: '',
  FB_VERIFY_TOKEN: '',
  FB_APP_SECRET: null,
  FACEBOOK_API_VERSION: '',
  ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: false,
  FB_FEED_COMMENTS_ENABLED: false,
};

const EMPTY_WHATSAPP = {
  WP_APP_ID: '',
  WP_VERIFY_TOKEN: '',
  WP_APP_SECRET: null,
  WP_WHATSAPP_CONFIG_ID: '',
  WP_API_VERSION: '',
};

const EMPTY_INSTAGRAM = {
  INSTAGRAM_APP_ID: '',
  INSTAGRAM_APP_SECRET: null,
  INSTAGRAM_VERIFY_TOKEN: '',
  INSTAGRAM_API_VERSION: '',
  ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT: false,
};

const CONFIGURED_FACEBOOK = {
  FB_APP_ID: 'test-fb-app-id',
  FB_VERIFY_TOKEN: 'test-verify-token',
  FB_APP_SECRET: '••••masked',
  FACEBOOK_API_VERSION: 'v18.0',
  ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: 'true',
  FB_FEED_COMMENTS_ENABLED: 'false',
};

const CONFIGURED_WHATSAPP = {
  WP_APP_ID: 'test-wp-app-id',
  WP_VERIFY_TOKEN: 'test-wp-verify-token',
  WP_APP_SECRET: '••••masked',
  WP_WHATSAPP_CONFIG_ID: 'test-config-id',
  WP_API_VERSION: 'v18.0',
};

const CONFIGURED_INSTAGRAM = {
  INSTAGRAM_APP_ID: 'test-ig-app-id',
  INSTAGRAM_APP_SECRET: '••••masked',
  INSTAGRAM_VERIFY_TOKEN: 'test-ig-verify-token',
  INSTAGRAM_API_VERSION: 'v18.0',
  ENABLE_INSTAGRAM_CHANNEL_HUMAN_AGENT: 'false',
};

const EMPTY_Ultra = {
  Ultra_API_URL: '',
  Ultra_ADMIN_SECRET: null,
};

const EMPTY_Ultra_GO = {
  Ultra_GO_API_URL: '',
  Ultra_GO_ADMIN_SECRET: null,
  Ultra_GO_INSTANCE_ID: '',
  Ultra_GO_INSTANCE_SECRET: null,
};

const EMPTY_TWITTER = {
  TWITTER_APP_ID: '',
  TWITTER_CONSUMER_KEY: '',
  TWITTER_CONSUMER_SECRET: null,
  TWITTER_ENVIRONMENT: '',
};

const CONFIGURED_Ultra = {
  Ultra_API_URL: 'https://ultra-api.test.com',
  Ultra_ADMIN_SECRET: '••••masked',
};

const CONFIGURED_Ultra_GO = {
  Ultra_GO_API_URL: 'https://ultra-go.test.com',
  Ultra_GO_ADMIN_SECRET: '••••masked',
  Ultra_GO_INSTANCE_ID: 'test-instance-id',
  Ultra_GO_INSTANCE_SECRET: '••••masked',
};

const CONFIGURED_TWITTER = {
  TWITTER_APP_ID: 'test-twitter-app-id',
  TWITTER_CONSUMER_KEY: 'test-consumer-key',
  TWITTER_CONSUMER_SECRET: '••••masked',
  TWITTER_ENVIRONMENT: 'production',
};

interface RenderOptions {
  fbData?: Record<string, unknown>;
  wpData?: Record<string, unknown>;
  igData?: Record<string, unknown>;
  ultraData?: Record<string, unknown>;
  ultraGoData?: Record<string, unknown>;
  twData?: Record<string, unknown>;
}

async function renderAndWait(options: RenderOptions = {}) {
  const {
    fbData = EMPTY_FACEBOOK,
    wpData = EMPTY_WHATSAPP,
    igData = EMPTY_INSTAGRAM,
    ultraData = EMPTY_Ultra,
    ultraGoData = EMPTY_Ultra_GO,
    twData = EMPTY_TWITTER,
  } = options;
  mockGetConfig.mockImplementation((type: string) => {
    if (type === 'facebook') return Promise.resolve(fbData);
    if (type === 'whatsapp') return Promise.resolve(wpData);
    if (type === 'instagram') return Promise.resolve(igData);
    if (type === 'ultra') return Promise.resolve(ultraData);
    if (type === 'ultra_go') return Promise.resolve(ultraGoData);
    if (type === 'twitter') return Promise.resolve(twData);
    return Promise.resolve({});
  });
  await act(async () => {
    render(<ChannelConfig />);
  });
}

describe('ChannelConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner before data loads', () => {
    mockGetConfig.mockReturnValue(new Promise(() => { }));
    const { container } = render(<ChannelConfig />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('loads config from all 6 channel endpoints', async () => {
    await renderAndWait();

    expect(mockGetConfig).toHaveBeenCalledWith('facebook');
    expect(mockGetConfig).toHaveBeenCalledWith('whatsapp');
    expect(mockGetConfig).toHaveBeenCalledWith('instagram');
    expect(mockGetConfig).toHaveBeenCalledWith('ultra');
    expect(mockGetConfig).toHaveBeenCalledWith('ultra_go');
    expect(mockGetConfig).toHaveBeenCalledWith('twitter');
  });

  it('renders title and description', async () => {
    await renderAndWait();

    expect(screen.getByText('channels.title')).toBeInTheDocument();
    expect(screen.getByText('channels.description')).toBeInTheDocument();
  });

  it('renders all 6 tab triggers', async () => {
    await renderAndWait();

    expect(screen.getByText('channels.facebook.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.whatsapp.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.instagram.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.Ultra.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.UltraGo.tabTitle')).toBeInTheDocument();
    expect(screen.getByText('channels.twitter.tabTitle')).toBeInTheDocument();
  });

  it('renders Facebook tab fields by default', async () => {
    await renderAndWait();

    expect(screen.getByLabelText('channels.facebook.fields.appId')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.facebook.fields.verifyToken')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.facebook.fields.appSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.facebook.fields.apiVersion')).toBeInTheDocument();
    expect(screen.getByText('channels.facebook.fields.humanAgent')).toBeInTheDocument();
    expect(screen.getByText('channels.facebook.fields.feedComments')).toBeInTheDocument();
  });

  it('renders WhatsApp tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.whatsapp.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.whatsapp.fields.appId')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.whatsapp.fields.verifyToken')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.whatsapp.fields.appSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.whatsapp.fields.configId')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.whatsapp.fields.apiVersion')).toBeInTheDocument();
  });

  it('renders Instagram tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.instagram.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.instagram.fields.appId')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.instagram.fields.appSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.instagram.fields.verifyToken')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.instagram.fields.apiVersion')).toBeInTheDocument();
    expect(screen.getByText('channels.instagram.fields.humanAgent')).toBeInTheDocument();
  });

  it('shows secret configured status for masked Facebook secret', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });

    const configured = screen.getAllByText('channels.secretConfigured');
    expect(configured.length).toBeGreaterThanOrEqual(1);
  });

  it('shows secret not configured when Facebook secret is empty', async () => {
    await renderAndWait();

    const notConfigured = screen.getAllByText('channels.secretNotConfigured');
    expect(notConfigured.length).toBeGreaterThanOrEqual(1);
  });

  it('saves Facebook tab independently via facebook config type', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        FB_APP_ID: 'test-fb-app-id',
      }));
    });
  });

  it('saves WhatsApp tab independently via whatsapp config type', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_WHATSAPP);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.whatsapp.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.whatsapp.fields.appId')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('whatsapp', expect.objectContaining({
        WP_APP_ID: 'test-wp-app-id',
      }));
    });
  });

  it('saves Instagram tab independently via instagram config type', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_INSTAGRAM);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.instagram.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.instagram.fields.appId')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('instagram', expect.objectContaining({
        INSTAGRAM_APP_ID: 'test-ig-app-id',
      }));
    });
  });

  it('sends null for unmodified secrets on Facebook save', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        FB_APP_SECRET: null,
      }));
    });
  });

  it('shows error toast when Facebook save fails', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockRejectedValue(new Error('Network error'));

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows error toast when load fails', async () => {
    mockGetConfig.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(<ChannelConfig />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('channels.messages.loadError');
    });
  });

  it('sends modified secret value on save after typing', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const secretInput = screen.getByLabelText('channels.facebook.fields.appSecret');

    await act(async () => {
      fireEvent.change(secretInput, { target: { value: 'new-secret-value' } });
    });

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        FB_APP_SECRET: 'new-secret-value',
      }));
    });
  });

  it('clear secret button marks secret as modified', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });

    const clearButtons = screen.getAllByTitle('channels.clearSecret');
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.click(clearButtons[0]);
    });

    // After clearing, the configured status should disappear for that field
    const remaining = screen.queryAllByText('channels.secretConfigured');
    // There should be fewer configured indicators now (or none if only one was shown)
    expect(remaining.length).toBe(0);
  });

  it('renders toggle fields as switches for boolean values', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });

    // Facebook has 2 toggle fields
    expect(screen.getByText('channels.facebook.fields.humanAgent')).toBeInTheDocument();
    expect(screen.getByText('channels.facebook.fields.feedComments')).toBeInTheDocument();

    // Switches should be rendered (role=switch)
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it('sends boolean values on Facebook save with toggles', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

    const saveButton = screen.getByText('channels.save');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
        ENABLE_MESSENGER_CHANNEL_HUMAN_AGENT: true,
        FB_FEED_COMMENTS_ENABLED: false,
      }));
    });
  });

  // --- Ultra Tab Tests ---

  it('renders Ultra tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.Ultra.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.Ultra.fields.apiUrl')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.Ultra.fields.adminSecret')).toBeInTheDocument();
  });

  it('saves Ultra tab independently via Ultra config type', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_Ultra);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.Ultra.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.Ultra.fields.apiUrl')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('ultra', expect.objectContaining({
        Ultra_API_URL: 'https://ultra-api.test.com',
      }));
    });
  });

  // --- Ultra Go Tab Tests ---

  it('renders Ultra Go tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.UltraGo.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.UltraGo.fields.apiUrl')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.UltraGo.fields.adminSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.UltraGo.fields.instanceId')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.UltraGo.fields.instanceSecret')).toBeInTheDocument();
  });

  it('saves Ultra Go tab independently via Ultra_go config type', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_Ultra_GO);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.UltraGo.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.UltraGo.fields.apiUrl')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('ultra_go', expect.objectContaining({
        Ultra_GO_API_URL: 'https://ultra-go.test.com',
        Ultra_GO_INSTANCE_ID: 'test-instance-id',
      }));
    });
  });

  // --- Twitter Tab Tests ---

  it('renders Twitter tab fields when tab is clicked', async () => {
    await renderAndWait();
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.twitter.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.twitter.fields.appId')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('channels.twitter.fields.consumerKey')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.twitter.fields.consumerSecret')).toBeInTheDocument();
    expect(screen.getByLabelText('channels.twitter.fields.environment')).toBeInTheDocument();
  });

  it('saves Twitter tab independently via twitter config type', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_TWITTER);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.twitter.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.twitter.fields.appId')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('twitter', expect.objectContaining({
        TWITTER_APP_ID: 'test-twitter-app-id',
        TWITTER_CONSUMER_KEY: 'test-consumer-key',
      }));
    });
  });

  it('sends null for unmodified secrets on Ultra Go save', async () => {
    await renderAndWait({ fbData: CONFIGURED_FACEBOOK, wpData: CONFIGURED_WHATSAPP, igData: CONFIGURED_INSTAGRAM, ultraData: CONFIGURED_Ultra, ultraGoData: CONFIGURED_Ultra_GO, twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockResolvedValue(CONFIGURED_Ultra_GO);
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.UltraGo.tabTitle'));

    await waitFor(() => {
      expect(screen.getByLabelText('channels.UltraGo.fields.apiUrl')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalledWith('ultra_go', expect.objectContaining({
        Ultra_GO_ADMIN_SECRET: null,
        Ultra_GO_INSTANCE_SECRET: null,
      }));
    });
  });

  // --- Error toast tests for new tabs ---

  it('shows error toast when Ultra save fails', async () => {
    await renderAndWait({ ultraData: CONFIGURED_Ultra });
    mockSaveConfig.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.Ultra.tabTitle'));
    await waitFor(() => {
      expect(screen.getByLabelText('channels.Ultra.fields.apiUrl')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    });
  });

  it('shows error toast when Ultra Go save fails', async () => {
    await renderAndWait({ ultraGoData: CONFIGURED_Ultra_GO });
    mockSaveConfig.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.UltraGo.tabTitle'));
    await waitFor(() => {
      expect(screen.getByLabelText('channels.UltraGo.fields.apiUrl')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    });
  });

  it('shows error toast when Twitter save fails', async () => {
    await renderAndWait({ twData: CONFIGURED_TWITTER });
    mockSaveConfig.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.twitter.tabTitle'));
    await waitFor(() => {
      expect(screen.getByLabelText('channels.twitter.fields.appId')).toBeInTheDocument();
    });

    await user.click(screen.getByText('channels.save'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Test error');
    });
  });

  // --- Clear secret tests for new tabs ---

  it('clear secret on Ultra tab marks secret as modified', async () => {
    await renderAndWait({ ultraData: CONFIGURED_Ultra });
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.Ultra.tabTitle'));
    await waitFor(() => {
      expect(screen.getByLabelText('channels.Ultra.fields.adminSecret')).toBeInTheDocument();
    });

    const clearButtons = screen.getAllByTitle('channels.clearSecret');
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.click(clearButtons[0]);
    });

    // After clearing, configured status should disappear
    const remaining = screen.queryAllByText('channels.secretConfigured');
    expect(remaining.length).toBe(0);
  });

  it('clear secret on Ultra Go tab marks secret as modified', async () => {
    await renderAndWait({ ultraGoData: CONFIGURED_Ultra_GO });
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.UltraGo.tabTitle'));
    await waitFor(() => {
      expect(screen.getByLabelText('channels.UltraGo.fields.adminSecret')).toBeInTheDocument();
    });

    // Ultra Go has 2 configured secrets
    const configuredBefore = screen.getAllByText('channels.secretConfigured');
    expect(configuredBefore.length).toBe(2);

    const clearButtons = screen.getAllByTitle('channels.clearSecret');
    await act(async () => {
      fireEvent.click(clearButtons[0]);
    });

    // One fewer configured indicator
    const configuredAfter = screen.getAllByText('channels.secretConfigured');
    expect(configuredAfter.length).toBe(1);
  });

  it('clear secret on Twitter tab marks secret as modified', async () => {
    await renderAndWait({ twData: CONFIGURED_TWITTER });
    const user = userEvent.setup();

    await user.click(screen.getByText('channels.twitter.tabTitle'));
    await waitFor(() => {
      expect(screen.getByLabelText('channels.twitter.fields.consumerSecret')).toBeInTheDocument();
    });

    const clearButtons = screen.getAllByTitle('channels.clearSecret');
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);

    await act(async () => {
      fireEvent.click(clearButtons[0]);
    });

    const remaining = screen.queryAllByText('channels.secretConfigured');
    expect(remaining.length).toBe(0);
  });

  describe('required enforcement', () => {
    // Each integration renders its own Save button inside its tab. The forms
    // share the same required-string + SECRET_SENTINEL pattern, so we exercise
    // the invariants on the default tab (Facebook) and on one representative
    // secondary tab (WhatsApp) that has the largest required-key set.
    it('disables Facebook Save button when required fields are empty on mount', async () => {
      await renderAndWait();

      const saveButton = screen.getAllByText('channels.save')[0].closest('button');
      expect(saveButton).toBeDisabled();
    });

    it('enables Facebook Save button when all required fields + masked secret are populated', async () => {
      await renderAndWait({ fbData: CONFIGURED_FACEBOOK });

      const saveButton = screen.getAllByText('channels.save')[0].closest('button');
      expect(saveButton).not.toBeDisabled();
    });

    it('shows inline required errors on Facebook only after first submit attempt', async () => {
      await renderAndWait();

      // Before any submit: no inline required errors
      expect(screen.queryAllByText('common:validation.required').length).toBe(0);

      // Save button is disabled in empty state; simulate Enter-key submit by firing
      // the form submit event directly (the browser path when inputs are focused).
      const form = screen.getAllByText('channels.save')[0].closest('form') as HTMLFormElement;
      await act(async () => {
        fireEvent.submit(form);
      });

      // Facebook has exactly 3 required fields: FB_APP_ID, FB_VERIFY_TOKEN, FB_APP_SECRET.
      // Scope to the form so other tabs' fields never inflate the count.
      await waitFor(() => {
        expect(within(form).getAllByText('common:validation.required')).toHaveLength(3);
      });
      expect(within(form).getByLabelText('channels.facebook.fields.appId')).toHaveAttribute('aria-invalid', 'true');
      expect(mockSaveConfig).not.toHaveBeenCalled();
    });

    it('saves Facebook when all required fields are filled', async () => {
      await renderAndWait({ fbData: CONFIGURED_FACEBOOK });
      mockSaveConfig.mockResolvedValue(CONFIGURED_FACEBOOK);

      const saveButton = screen.getAllByText('channels.save')[0].closest('button') as HTMLButtonElement;
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockSaveConfig).toHaveBeenCalledWith('facebook', expect.objectContaining({
          FB_APP_ID: 'test-fb-app-id',
          FB_VERIFY_TOKEN: 'test-verify-token',
          // Masked secret loaded from backend → sentinel → buildPayload maps back to null.
          FB_APP_SECRET: null,
        }));
      });
    });

    it('blocks WhatsApp save when a required key is cleared', async () => {
      await renderAndWait({ wpData: CONFIGURED_WHATSAPP });
      const user = userEvent.setup();

      await user.click(screen.getByText('channels.whatsapp.tabTitle'));

      const configIdInput = await screen.findByLabelText('channels.whatsapp.fields.configId');
      await act(async () => {
        fireEvent.change(configIdInput, { target: { value: '' } });
      });

      // The WhatsApp Save lives under the whatsapp tab; it's the Save button for
      // that form. Same label for every card, so grab the visible one.
      const whatsappSave = screen.getAllByText('channels.save')[0].closest('button');
      expect(whatsappSave).toBeDisabled();
    });
  });
});
