import React from 'react'
import './BodyLayout.css'

type Props = {
  children?: React.ReactNode
}

export default function BodyLayout({ children }: Props) {
  return (
    <div className="body-layout">
      <div className="body-container">{children}</div>
    </div>
  )
}
