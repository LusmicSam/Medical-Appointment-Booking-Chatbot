// File: src/components/ui/button.jsx
import * as React from "react"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? "button" : "button"
  
  // Base styles
  let baseStyles = `
    inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
  `
  
  // Variant styles
  let variantStyles = ""
  if (variant === "default") {
    variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90"
  } else if (variant === "destructive") {
    variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  } else if (variant === "outline") {
    variantStyles = "border border-input hover:bg-accent hover:text-accent-foreground"
  } else if (variant === "secondary") {
    variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  } else if (variant === "ghost") {
    variantStyles = "hover:bg-accent hover:text-accent-foreground"
  } else if (variant === "link") {
    variantStyles = "text-primary underline-offset-4 hover:underline"
  }
  
  // Size styles
  let sizeStyles = ""
  if (size === "default") {
    sizeStyles = "h-10 py-2 px-4"
  } else if (size === "sm") {
    sizeStyles = "h-9 px-3 rounded-md"
  } else if (size === "lg") {
    sizeStyles = "h-11 px-8 rounded-md"
  } else if (size === "icon") {
    sizeStyles = "h-10 w-10"
  }
  
  return (
    <Comp
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button }