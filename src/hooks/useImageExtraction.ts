/**
 * Image extraction hook
 */
import { useState } from "react"
import { Platform } from "react-native"
import { extractionService } from "@/api/services/extraction.service"
import type { PickedImage } from "./useImagePicker"
import type { ImageExtractionResponse } from "@/types/extraction"

export function useImageExtraction() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitImages = async (
    images: PickedImage[]
  ): Promise<ImageExtractionResponse | null> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()

      // Append each image to FormData
      images.forEach((image) => {
        const file: any = {
          uri:
            Platform.OS === "android"
              ? image.uri
              : image.uri.replace("file://", ""),
          type: image.type,
          name: image.name,
        }

        formData.append("files", file)
      })

      const response = await extractionService.submitImages(formData)
      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitImages,
    isSubmitting,
    error,
  }
}
