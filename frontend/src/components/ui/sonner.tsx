import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"
type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group toast rounded-md border px-4 py-3 shadow-lg text-sm font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

// Typed toast helpers without importing ToastOptions
const toast = {
  success: (msg: string, opts?: any) =>
    sonnerToast(msg, {
      ...opts,
      type: "success",
      className: "bg-green-100 text-green-800 border-green-200",
    }),
  error: (msg: string, opts?: any) =>
    sonnerToast(msg, {
      ...opts,
      type: "error",
      className: "bg-red-100 text-red-800 border-red-200",
    }),
}

export { Toaster, toast }
