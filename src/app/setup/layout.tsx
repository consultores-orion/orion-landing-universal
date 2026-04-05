interface SetupLayoutProps {
  children: React.ReactNode
}

export default function SetupLayout({ children }: SetupLayoutProps) {
  return (
    <div className="from-surface to-background flex min-h-screen flex-col items-center justify-center bg-gradient-to-br">
      <div className="w-full max-w-[600px] p-6 pb-12">
        <div className="mb-8 text-center">
          <h2 className="text-primary text-2xl font-bold tracking-tight">Orion Landing</h2>
          <p className="text-muted-foreground mt-1 text-sm">Setup Wizard</p>
        </div>
        {children}
      </div>
    </div>
  )
}
