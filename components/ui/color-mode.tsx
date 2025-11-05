"use client";

import * as React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { IconButton, Skeleton } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";

// Client-only wrapper
export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

// Hook to get and toggle color mode
export function useColorMode() {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const colorMode = forcedTheme || resolvedTheme;

  const toggleColorMode = () => {
    setTheme(colorMode === "dark" ? "light" : "dark");
  };

  return { colorMode, setColorMode: setTheme, toggleColorMode };
}

// Returns light or dark value based on current color mode
export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

// Icon that reflects current color mode
export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? <LuMoon /> : <LuSun />;
}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, any>(
  function ColorModeButton(props, ref) {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
      <IconButton
        onClick={toggleColorMode}
        aria-label="Toggle color mode"
        variant="ghost"
        size="sm"
        ref={ref}
        {...props}
      >
        {colorMode === "dark" ? <LuMoon /> : <LuSun />}
      </IconButton>
    );
  }
);