import type { TooltipRenderProps } from 'react-joyride';
import { useTranslation } from '@/hooks/useTranslation';

export function JoyrideTooltip({
  continuous,
  controls,
  index,
  isLastStep,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) {
  const { t } = useTranslation('tours');
  return (
    <div
      {...tooltipProps}
      style={{
        background: '#1a1f2e',
        border: '1px solid #2a2f3a',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '340px',
        width: '340px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2a6fd6',
              flexShrink: 0,
            }}
          />
          {step.title && (
            <span
              style={{
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: 1.4,
              }}
            >
              {step.title}
            </span>
          )}
        </div>
        <button
          {...closeProps}
          onClick={() => controls.skip()}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0 0 0 8px',
            fontSize: '18px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          color: '#94a3b8',
          fontSize: '13px',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        {step.content}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: '#1c1f2a',
          marginBottom: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 2,
            background: '#2a6fd6',
            width: `${((index + 1) / size) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Left: "X de Y" */}
        <span style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {t('stepOf', { current: index + 1, total: size })}
        </span>

        {/* Right: Back + Next/Finish buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: 'transparent',
                border: '1px solid #2a2f3a',
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                lineHeight: 1.4,
              }}
            >
              {t('back')}
            </button>
          )}
          {continuous && (
            <button
              {...primaryProps}
              style={{
                background: '#014293',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                lineHeight: 1.4,
              }}
            >
              {isLastStep ? t('finish') : t('next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
