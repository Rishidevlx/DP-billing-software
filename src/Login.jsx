import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import lottie from 'lottie-web';
import animationData from './assets/growth-software.json';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const lottieContainer = useRef(null);

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: lottieContainer.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData,
    });
    return () => anim.destroy();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* LEFT SIDE */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0E0D3A 0%, #1a1860 100%)',
        color: '#fff',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        {/* Lottie Animation Container */}
        <div ref={lottieContainer} style={{ width: '100%', maxWidth: '520px', height: '380px' }} />

        <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/src/assets/DP-logo.png" alt="DP Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem', background: '#fff', borderRadius: '50%', padding: '0.25rem' }} />
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Dolphin Publications
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>
            Professional Billing System
          </p>
        </div>
      </div>
      
      {/* RIGHT SIDE */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <div style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
          <h2 className="text-3xl font-semibold text-black mb-2">Welcome Back</h2>
          <p className="text-[#94A3B8] mb-10">Please enter your credentials to login.</p>
          
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">Username</label>
              <div className="relative flex items-center">
                <User size={20} className="absolute left-4 text-[#94A3B8]" />
                <input 
                  type="text" 
                  placeholder="Enter your username" 
                  defaultValue="admin_user"
                  className="w-full py-3 pl-12 pr-4 border border-slate-200 rounded-lg text-base text-black bg-slate-50 outline-none transition-colors duration-300 focus:border-[#0E0D3A] focus:bg-white"
                />
              </div>
            </div>
            
            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">Password</label>
              <div className="relative flex items-center">
                <Lock size={20} className="absolute left-4 text-[#94A3B8]" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  defaultValue="dolphin_pass123"
                  className="w-full py-3 pl-12 pr-12 border border-slate-200 rounded-lg text-base text-black bg-slate-50 outline-none transition-colors duration-300 focus:border-[#0E0D3A] focus:bg-white"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#94A3B8] hover:text-black transition-colors flex items-center justify-center p-0 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center gap-2 text-sm text-black cursor-pointer">
                <input 
                  type="checkbox" 
                  style={{ accentColor: '#0E0D3A' }}
                  className="w-4 h-4 cursor-pointer"
                />
                Is Admin
              </label>
              <a href="#" className="text-sm font-medium no-underline hover:underline" style={{ color: '#0E0D3A' }}>
                Forgotten password?
              </a>
            </div>
            
            {/* Login Button */}
            <button 
              type="submit" 
              style={{ backgroundColor: '#0E0D3A', color: '#fff' }}
              className="mt-4 p-4 rounded-lg text-base font-medium cursor-pointer border-none transition-all duration-300 active:scale-[0.98]"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1860'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0E0D3A'}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
