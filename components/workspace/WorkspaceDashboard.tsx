import { Hash, MessageSquare } from 'lucide-react'
import React from 'react'

function WorkspaceDashboard() {
  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full">
      {/* Top Header of the Channel */}
      <div className="h-16 border-b border-border/60 flex items-center px-6 bg-background shrink-0">
        <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
          <Hash size={22} className="text-muted-foreground" />
          general
        </div>
      </div>

      {/* Chat Messages Space */}
      <div className="flex-1 p-6 flex items-center justify-center text-muted-foreground flex-col overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <MessageSquare size={32} className="text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-medium text-foreground mb-2">
          Welcome to #general
        </h3>
        <p className="text-sm max-w-md text-center">
          This is the start of the <strong>#general</strong> channel. This is where your team can chat and collaborate.
        </p>
      </div>

      {/* Message Input Box Mockup */}
      <div className="p-4 bg-background shrink-0">
        <div className="h-14 border border-border/80 rounded-xl bg-card flex items-center px-4 text-muted-foreground text-sm shadow-sm">
          Message #general...
        </div>
      </div>
    </div>
  )
}

export default WorkspaceDashboard