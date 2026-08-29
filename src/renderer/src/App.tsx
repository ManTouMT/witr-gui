import React from 'react'
import { TrayView } from './components/tray/TrayView'
import { WorkbenchView } from './components/workbench/WorkbenchView'
import { ToastContainer } from './components/ui/ToastContainer'

export const App: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode') || 'workbench'

  return (
    <div className="w-full h-full">
      {mode === 'tray' ? <TrayView /> : <WorkbenchView />}
      <ToastContainer />
    </div>
  )
}
