interface LoginLayoutProps {
  children: React.ReactNode
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="from-surface to-background flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="w-full max-w-md p-6">{children}</div>
    </div>
  )
}
