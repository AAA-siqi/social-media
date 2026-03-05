"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("common")
  const [mounted, setMounted] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="relative h-7 w-12 rounded-full bg-muted transition-colors"
          aria-label={t("theme")}
        >
          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-muted-foreground/20" />
        </button>
      </div>
    )
  }

  const currentTheme = theme === "system" ? "system" : theme

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    setShowPopup(false)
  }

  return (
    <div className="relative">
      {/* 滑动开关主按钮 */}
      <button
        onClick={() => {
          if (currentTheme === "light") {
            setTheme("dark")
          } else if (currentTheme === "dark") {
            setTheme("system")
          } else {
            setTheme("light")
          }
        }}
        className="relative h-7 w-12 rounded-full bg-muted transition-all duration-300 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring/50"
        aria-label={`${t("theme")}: ${currentTheme === "light" ? t("light") : currentTheme === "dark" ? t("dark") : t("system")}`}
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
      >
        {/* 滑块 */}
        <div
          className={`absolute top-1 h-5 w-5 rounded-full bg-primary shadow-md transition-all duration-300 ease-out ${
            currentTheme === "light" ? "left-1" : currentTheme === "dark" ? "left-[calc(100%-1.25rem)]" : "left-1/2 -translate-x-1/2"
          }`}
        >
          {/* 滑块内的图标 */}
          <div className="flex h-full w-full items-center justify-center text-primary-foreground">
            {currentTheme === "light" && <Sun className="h-3 w-3" />}
            {currentTheme === "dark" && <Moon className="h-3 w-3" />}
            {currentTheme === "system" && <Monitor className="h-3 w-3" />}
          </div>
        </div>

        {/* 背景图标 */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 opacity-30">
          <Sun className="h-3 w-3" />
          <Moon className="h-3 w-3" />
        </div>
      </button>

      {/* 弹出提示 */}
      {showPopup && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 glass-static rounded-xl p-1.5 shadow-xl animate-fade-in min-w-[120px]">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                currentTheme === "light" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>{t("light")}</span>
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                currentTheme === "dark" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>{t("dark")}</span>
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                currentTheme === "system" ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>{t("system")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
