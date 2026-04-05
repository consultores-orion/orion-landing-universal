'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phoneNumber: string
  message: string
  position: 'left' | 'right'
}

export function WhatsAppButton({ phoneNumber, message, position }: WhatsAppButtonProps) {
  if (!phoneNumber) return null

  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const href = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
  const posClass = position === 'left' ? 'left-6' : 'right-6'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 ${posClass} z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110`}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
