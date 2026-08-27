import React, { forwardRef, useState, useEffect } from 'react';
import ClassicTemplate from '../../templates/ClassicTemplate';
import Template1 from '../../templates/Template1';
import Template2 from '../../templates/Template2';
import Template3 from '../../templates/Template3';
import Template4 from '../../templates/Template4';
import Template5 from '../../templates/Template5';
import { settingsApi } from '../../services/api';

const PrintReturn = forwardRef(({ returnData }, ref) => {
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
    case 'template1':
    case 'modern':
      return <Template1 ref={ref} data={returnData} type="return" />;
    case 'template2':
    case 'legal':
      return <Template2 ref={ref} data={returnData} type="return" />;
    case 'template3':
    case 'elegant':
      return <Template3 ref={ref} data={returnData} type="return" />;
    case 'template4':
    case 'minimalist':
      return <Template4 ref={ref} data={returnData} type="return" />;
    case 'template5':
    case 'vibrant':
      return <Template5 ref={ref} data={returnData} type="return" />;
    case 'classic':
    default:
      return <ClassicTemplate ref={ref} data={returnData} type="return" />;
  }
});

export default PrintReturn;
