import React, { forwardRef, useState, useEffect } from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import ElegantTemplate from './templates/ElegantTemplate';
import MinimalistTemplate from './templates/MinimalistTemplate';
import VibrantTemplate from './templates/VibrantTemplate';
import { settingsApi } from '../../services/api';

const PrintInvoice = forwardRef(({ billData }, ref) => {
  const [template, setTemplate] = useState('classic');

  useEffect(() => {
    const savedTemplate = localStorage.getItem('invoiceTemplate');
    if (savedTemplate) {
      setTemplate(savedTemplate);
    } else {
      settingsApi.getAll().then(data => {
        const t = data.find(s => s.setting_key === 'invoiceTemplate');
        if (t) {
          setTemplate(t.setting_value);
          localStorage.setItem('invoiceTemplate', t.setting_value);
        }
      }).catch(() => {});
    }
  }, []);

  switch (template) {
    case 'modern':
      return <ModernTemplate ref={ref} billData={billData} />;
    case 'elegant':
      return <ElegantTemplate ref={ref} billData={billData} />;
    case 'vibrant':
      return <VibrantTemplate ref={ref} billData={billData} />;
    case 'minimalist':
      return <MinimalistTemplate ref={ref} billData={billData} />;
    case 'classic':
    default:
      return <ClassicTemplate ref={ref} billData={billData} />;
  }
});

export default PrintInvoice;
