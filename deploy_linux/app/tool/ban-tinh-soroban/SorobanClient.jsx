'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import SorobanBoard from '@/components/Soroban/SorobanBoard';
import { useI18n } from '@/lib/i18n/I18nContext';

export default function BanTinhSoroban() {
  const { t, locale } = useI18n();
  const [currentValue, setCurrentValue] = useState(0);

  // Handle value change from SorobanBoard
  const handleValueChange = useCallback((value) => {
    setCurrentValue(value);
  }, []);

  return (
    <ToolLayout toolName={t('toolbox.tools.soroban.name')} toolIcon="🧮">
      <div className="max-w-6xl mx-auto">
        {/* Soroban Board */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          {/* Giá trị hiện tại - nhỏ gọn */}
          <div className="flex items-center justify-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <span className="text-gray-500">{t('toolbox.sorobanTool.value')}:</span>
            <span className="text-3xl font-bold text-violet-600">
              {currentValue.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
            </span>
          </div>
          <SorobanBoard
            targetNumber={null}
            onValueChange={handleValueChange}
            showHints={true}
            resetKey={0}
            columns={9}
            responsive={true}
          />
        </div>
      </div>
    </ToolLayout>
  );
}

