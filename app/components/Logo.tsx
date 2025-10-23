"use client"

import Image from 'next/image'
import { useState } from 'react'

export default function Logo() {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return null
  }

  return (
    <Image 
      src="/logo.png" 
      alt="Server Logo" 
      width={44} 
      height={44} 
      priority 
      onError={() => setImageError(true)}
    />
  )
}
