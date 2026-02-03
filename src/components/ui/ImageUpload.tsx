'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, X, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
    currentImageUrl?: string | null
    userId: string
    initials: string
    onUploadComplete?: (url: string) => void
    onUploadError?: (error: string) => void
    maxSizeMB?: number
    acceptedFormats?: string[]
}

export function ImageUpload({
    currentImageUrl,
    userId,
    initials,
    onUploadComplete,
    onUploadError,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/jpg']
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const maxSizeBytes = maxSizeMB * 1024 * 1024

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        // Validate format
        if (!acceptedFormats.includes(file.type)) {
            const errorMsg = 'Formato inválido. Use JPG ou PNG.'
            setError(errorMsg)
            onUploadError?.(errorMsg)
            return
        }

        // Validate size
        if (file.size > maxSizeBytes) {
            const errorMsg = `Arquivo muito grande. Máximo: ${maxSizeMB}MB.`
            setError(errorMsg)
            onUploadError?.(errorMsg)
            return
        }

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        // Upload to Supabase Storage
        setIsUploading(true)
        try {
            const supabase = createClient()

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/avatar.${fileExt}`

            // Upload file
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // Add timestamp to bust cache
            const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`
            setPreviewUrl(urlWithTimestamp)
            onUploadComplete?.(urlWithTimestamp)

        } catch (err: any) {
            console.error('Upload error:', err)
            const errorMsg = 'Erro ao enviar imagem. Tente novamente.'
            setError(errorMsg)
            onUploadError?.(errorMsg)
            // Revert to original
            setPreviewUrl(currentImageUrl || null)
        } finally {
            setIsUploading(false)
        }

        // Clear the input
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const handleRemove = () => {
        setPreviewUrl(null)
        setError(null)
        // Note: We don't delete from storage here, just clear the reference
        // The actual deletion can be done when saving the profile
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={previewUrl || undefined} />
                    <AvatarFallback className="bg-alma-lilac-200 text-2xl font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay on hover */}
                <div
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => inputRef.current?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </div>

                {/* Remove button */}
                {previewUrl && !isUploading && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <Camera className="w-4 h-4" />
                        {previewUrl ? 'Alterar foto' : 'Adicionar foto'}
                    </>
                )}
            </Button>

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}

            {/* Size hint */}
            <p className="text-xs text-alma-blue-900/50">
                JPG ou PNG, máximo {maxSizeMB}MB
            </p>
        </div>
    )
}
