import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  className?: string;
  inputClassName?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function OTPInput({
  length = 6,
  onComplete,
  className,
  inputClassName,
  value = "",
  onChange,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  // Set OTP from external value prop
  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, length);
      setOtp(otpArray.concat(Array(length - otpArray.length).fill("")));
    }
  }, [value, length]);

  const focusInput = (targetIndex: number) => {
    const targetInput = inputsRef.current[targetIndex];
    if (targetInput) {
      targetInput.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value;
    
    // Only take the last character if multiple are pasted/entered
    const char = newValue.slice(-1);
    
    // Check if input is a number
    if (!/^\d*$/.test(char) && char !== "") {
      return;
    }
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    
    // Call onChange prop with joined OTP
    const otpString = newOtp.join("");
    if (onChange) {
      onChange(otpString);
    }
    
    // Auto-focus next input if this one is filled
    if (char && index < length - 1) {
      focusInput(index + 1);
    }
    
    // Call onComplete if all inputs are filled
    if (newOtp.every(val => val !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move focus to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Clear previous input when backspace is pressed on empty input
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      
      // Call onChange prop with joined OTP
      if (onChange) {
        onChange(newOtp.join(""));
      }
      
      focusInput(index - 1);
    }
    
    // Move focus with arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Check if pasted content is all digits
    if (!/^\d*$/.test(pastedData)) {
      return;
    }
    
    const pastedChars = pastedData.slice(0, length - index).split("");
    const newOtp = [...otp];
    
    // Fill the current and subsequent inputs with pasted characters
    for (let i = 0; i < pastedChars.length; i++) {
      if (index + i < length) {
        newOtp[index + i] = pastedChars[i];
      }
    }
    
    setOtp(newOtp);
    
    // Call onChange prop with joined OTP
    if (onChange) {
      onChange(newOtp.join(""));
    }
    
    // Focus the next unfilled input or the last input
    const nextIndex = Math.min(index + pastedChars.length, length - 1);
    focusInput(nextIndex);
    
    // Call onComplete if all inputs are filled
    if (newOtp.every(val => val !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          className={cn(
            "w-12 h-12 text-center text-xl font-medium",
            inputClassName
          )}
        />
      ))}
    </div>
  );
}
