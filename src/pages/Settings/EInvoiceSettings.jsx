import React, { useState, useEffect } from 'react';
import { Save, Shield, ShieldAlert, Check, Server } from 'lucide-react';

const EInvoiceSettings = () => {
  const [activeTab, setActiveTab] = useState('sandbox');
  const [config, setConfig] = useState({
    activeEnv: 'sandbox',
    sandbox: {
      clientId: '',
      clientSecret: '',
      username: '',
      password: '',
    },
    prod: {
      clientId: '',
      clientSecret: '',
      username: '',
      password: '',
      gspName: '',
    }
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('einvoice_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleChange = (env, field, value) => {
    setConfig(prev => ({
      ...prev,
      [env]: {
        ...prev[env],
        [field]: value
      }
    }));
    setSaved(false);
  };

  const handleActiveEnvChange = (env) => {
    setConfig(prev => ({
      ...prev,
      activeEnv: env
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('einvoice_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 dark:bg-[#0B0A26]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">E-Invoice API Configuration</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your API keys for Sandbox (Testing) and Production (Live).</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Saved Successfully' : 'Save Settings'}
          </button>
        </div>

        <div className="bg-white dark:bg-[#1E1E2D] rounded-lg shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Active Environment</h2>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${config.activeEnv === 'sandbox' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-white/10 hover:border-amber-500/50'}`}>
                <input 
                  type="radio" 
                  name="activeEnv" 
                  checked={config.activeEnv === 'sandbox'}
                  onChange={() => handleActiveEnvChange('sandbox')}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <div className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-500" />
                    Sandbox (Testing)
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Use for testing without affecting live GST data.</div>
                </div>
              </label>

              <label className={`flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${config.activeEnv === 'prod' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/50'}`}>
                <input 
                  type="radio" 
                  name="activeEnv" 
                  checked={config.activeEnv === 'prod'}
                  onChange={() => handleActiveEnvChange('prod')}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" />
                    Production (Live)
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Use for real live E-Invoicing and E-Way bills.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E2D] rounded-lg shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-white/10">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'sandbox' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('sandbox')}
            >
              Sandbox API Keys
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'prod' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('prod')}
            >
              Production API Keys
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'sandbox' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md text-sm mb-4">
                  Register at <strong>einv-apisandbox.nic.in</strong> to get Sandbox credentials.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client ID</label>
                    <input 
                      type="text" 
                      value={config.sandbox.clientId}
                      onChange={(e) => handleChange('sandbox', 'clientId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter Client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Secret</label>
                    <input 
                      type="password" 
                      value={config.sandbox.clientSecret}
                      onChange={(e) => handleChange('sandbox', 'clientSecret', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter Client Secret"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Username</label>
                    <input 
                      type="text" 
                      value={config.sandbox.username}
                      onChange={(e) => handleChange('sandbox', 'username', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter API Username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Password</label>
                    <input 
                      type="password" 
                      value={config.sandbox.password}
                      onChange={(e) => handleChange('sandbox', 'password', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter API Password"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prod' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md text-sm mb-4">
                  For production, if turnover is &lt; 500 Cr, register via a GSP (e.g., ClearTax) on <strong>einvoice1.gst.gov.in</strong>.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSP Provider (Optional)</label>
                    <select 
                      value={config.prod.gspName}
                      onChange={(e) => handleChange('prod', 'gspName', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                    >
                      <option value="">Direct / None</option>
                      <option value="cleartax">ClearTax</option>
                      <option value="mastersindia">Masters India</option>
                      <option value="gstzen">GST Zen</option>
                      <option value="zoho">Zoho</option>
                      <option value="tally">Tally</option>
                    </select>
                  </div>
                  <div className="hidden md:block"></div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client ID</label>
                    <input 
                      type="text" 
                      value={config.prod.clientId}
                      onChange={(e) => handleChange('prod', 'clientId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter Client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Secret</label>
                    <input 
                      type="password" 
                      value={config.prod.clientSecret}
                      onChange={(e) => handleChange('prod', 'clientSecret', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter Client Secret"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Username</label>
                    <input 
                      type="text" 
                      value={config.prod.username}
                      onChange={(e) => handleChange('prod', 'username', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter API Username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Password</label>
                    <input 
                      type="password" 
                      value={config.prod.password}
                      onChange={(e) => handleChange('prod', 'password', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      placeholder="Enter API Password"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EInvoiceSettings;
