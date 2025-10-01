import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
  onButtonClick?: () => void
}

const SuccessModal = React.forwardRef<HTMLDivElement, SuccessModalProps>(
  ({ isOpen, onClose, title, message, buttonText = "Continue", onButtonClick }, ref) => {
    if (!isOpen) return null

    const handleButtonClick = () => {
      if (onButtonClick) {
        onButtonClick()
      } else {
        onClose()
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <Card 
          ref={ref}
          className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-0 bg-white"
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center pb-6">
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleButtonClick}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {buttonText}
              </Button>
            </div>
          </CardContent>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </Card>
      </div>
    )
  }
)

SuccessModal.displayName = "SuccessModal"

export { SuccessModal }
