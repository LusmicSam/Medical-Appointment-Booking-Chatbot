// File: src/components/mode-toggle.jsx
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

import { Button } from "./ui/button"

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
  
    return (
      <div
        className="mode-toggle-btn"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Sun className="icon" />
        ) : (
          <Moon className="icon" />
        )}
      </div>
    );
  }