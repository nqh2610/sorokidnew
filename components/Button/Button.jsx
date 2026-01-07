'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '@/lib/soundManager';

/**
 * 🎯 BUTTON COMPONENT - Touch-Friendly Buttons
 * 
 * - Touch targets tối thiểu 44px (iOS/Android guidelines)
 * - Feedback animation khi click
 * - Tích hợp sound effects
 * - Child-friendly với emoji support
 * 
 * Usage:
 * <Button variant="primary" size="lg">Bắt đầu</Button>
 * <Button variant="success" icon="✅">Đúng rồi</Button>
 * <IconButton icon={<ArrowLeft />} />
 */

// Size configs với minimum 44px touch target
const SIZES = {
  xs: 'min-h-[36px] px-3 text-xs',
  sm: 'min-h-[40px] px-4 text-sm',
  md: 'min-h-[48px] px-6 text-base',   // 44px+ touch target
  lg: 'min-h-[56px] px-8 text-lg',
  xl: 'min-h-[64px] px-10 text-xl',
};

// Variant styles
const VARIANTS = {
  primary: `
    bg-gradient-to-r from-purple-500 to-pink-500
    text-white font-semibold
    hover:from-purple-600 hover:to-pink-600
    shadow-lg hover:shadow-xl
    active:scale-95
  `,
  secondary: `
    bg-white text-gray-700
    border-2 border-gray-200
    hover:border-purple-300 hover:bg-purple-50
    shadow-md hover:shadow-lg
    active:scale-95
  `,
  success: `
    bg-gradient-to-r from-green-500 to-emerald-500
    text-white font-semibold
    hover:from-green-600 hover:to-emerald-600
    shadow-lg hover:shadow-xl
    active:scale-95
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-rose-500
    text-white font-semibold
    hover:from-red-600 hover:to-rose-600
    shadow-lg hover:shadow-xl
    active:scale-95
  `,
  warning: `
    bg-gradient-to-r from-yellow-400 to-orange-500
    text-white font-semibold
    hover:from-yellow-500 hover:to-orange-600
    shadow-lg hover:shadow-xl
    active:scale-95
  `,
  ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100
    active:scale-95
  `,
  game: `
    bg-gradient-to-b from-yellow-400 to-yellow-500
    text-yellow-900 font-bold
    border-4 border-yellow-300
    shadow-[0_6px_0_0_#ca8a04]
    hover:shadow-[0_4px_0_0_#ca8a04] hover:translate-y-[2px]
    active:shadow-[0_0px_0_0_#ca8a04] active:translate-y-[6px]
  `,
};

const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  sound = 'click',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}, ref) {
  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Play sound
    if (sound) {
      playSound(sound);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-2xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${SIZES[size] || SIZES.md}
        ${VARIANTS[variant] || VARIANTS.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      
      {/* Icon left */}
      {icon && iconPosition === 'left' && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {/* Children */}
      {children}
      
      {/* Icon right */}
      {icon && iconPosition === 'right' && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </motion.button>
  );
});

/**
 * 🔘 ICON BUTTON - Chỉ có icon
 */
export const IconButton = forwardRef(function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  label,
  sound = 'click',
  className = '',
  onClick,
  ...props
}, ref) {
  const sizeClasses = {
    xs: 'w-8 h-8 text-sm',
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',    // 48px touch target
    lg: 'w-14 h-14 text-xl',
    xl: 'w-16 h-16 text-2xl',
  };

  const handleClick = (e) => {
    if (sound) playSound(sound);
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-200
        ${sizeClasses[size] || sizeClasses.md}
        ${VARIANTS[variant] || VARIANTS.ghost}
        ${className}
      `}
      title={label}
      aria-label={label}
      {...props}
    >
      {icon}
    </motion.button>
  );
});

/**
 * 🎮 GAME BUTTON - Cho màn hình game
 * Style giống button game 3D
 */
export const GameButton = forwardRef(function GameButton({
  children,
  color = 'yellow',
  size = 'lg',
  sound = 'click',
  disabled = false,
  className = '',
  onClick,
  ...props
}, ref) {
  const colors = {
    yellow: {
      bg: 'from-yellow-400 to-yellow-500',
      border: 'border-yellow-300',
      shadow: '#ca8a04',
      text: 'text-yellow-900',
    },
    green: {
      bg: 'from-green-400 to-green-500',
      border: 'border-green-300',
      shadow: '#15803d',
      text: 'text-green-900',
    },
    blue: {
      bg: 'from-blue-400 to-blue-500',
      border: 'border-blue-300',
      shadow: '#1d4ed8',
      text: 'text-white',
    },
    purple: {
      bg: 'from-purple-400 to-purple-500',
      border: 'border-purple-300',
      shadow: '#7c3aed',
      text: 'text-white',
    },
    red: {
      bg: 'from-red-400 to-red-500',
      border: 'border-red-300',
      shadow: '#dc2626',
      text: 'text-white',
    },
  };

  const c = colors[color] || colors.yellow;
  const sizeClass = SIZES[size] || SIZES.lg;

  const handleClick = (e) => {
    if (disabled) return;
    if (sound) playSound(sound);
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      whileTap={disabled ? {} : { y: 4 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-2xl
        bg-gradient-to-b ${c.bg}
        ${c.text} font-bold
        border-4 ${c.border}
        transition-all duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClass}
        ${className}
      `}
      style={{
        boxShadow: disabled ? 'none' : `0 6px 0 0 ${c.shadow}`,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
});

/**
 * 🔢 NUMBER PAD BUTTON - Cho nhập số
 */
export const NumberPadButton = forwardRef(function NumberPadButton({
  value,
  onPress,
  disabled = false,
  className = '',
}, ref) {
  const handleClick = () => {
    if (disabled) return;
    playSound('click');
    if (onPress) onPress(value);
  };

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.9 }}
      className={`
        w-16 h-16 sm:w-20 sm:h-20
        flex items-center justify-center
        text-2xl sm:text-3xl font-bold
        bg-white text-gray-800
        border-2 border-gray-200
        rounded-2xl
        shadow-md
        hover:bg-gray-50 hover:border-purple-300
        active:bg-purple-50
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150
        ${className}
      `}
    >
      {value}
    </motion.button>
  );
});

export default Button;
