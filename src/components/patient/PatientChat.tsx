'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    ArrowLeft,
    MessageCircle,
    Send,
    Search
} from 'lucide-react'

interface ChatRoom {
    id: string
    is_active: boolean
    last_message_at: string | null
    psychologists: {
        id: string
        crp: string
        profiles: {
            full_name: string
            photo_url: string | null
        }
    }
}

interface PatientChatProps {
    chatRooms: ChatRoom[]
    userId: string
}

export function PatientChat({ chatRooms, userId }: PatientChatProps) {
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
    const [message, setMessage] = useState('')

    const handleSendMessage = () => {
        if (!message.trim() || !selectedRoom) return
        // TODO: Implement real-time messaging with Supabase
        console.log('Sending message:', message)
        setMessage('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/patient/dashboard" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-alma-blue-900" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-alma-blue-900">Chat</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                    {/* Chat List */}
                    <Card className="border-0 shadow-lg lg:col-span-1 overflow-hidden">
                        <CardHeader className="border-b border-alma-lilac-100">
                            <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-green-600" />
                                Conversas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {chatRooms.length > 0 ? (
                                <div className="divide-y divide-alma-lilac-100">
                                    {chatRooms.map(room => {
                                        const initials = room.psychologists.profiles.full_name
                                            .split(' ')
                                            .map(n => n[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()

                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                className={`w-full p-4 text-left hover:bg-alma-lilac-50 transition-colors ${selectedRoom?.id === room.id ? 'bg-alma-lilac-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src={room.psychologists.profiles.photo_url || undefined} />
                                                        <AvatarFallback className="bg-alma-lilac-200">{initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-alma-blue-900 truncate">
                                                            {room.psychologists.profiles.full_name}
                                                        </h4>
                                                        <p className="text-sm text-alma-blue-900/50 truncate">
                                                            Clique para abrir o chat
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                    <p className="text-alma-blue-900/60 mb-4">Nenhuma conversa ativa</p>
                                    <p className="text-sm text-alma-blue-900/40">
                                        Agende uma consulta para iniciar o chat com seu psicólogo
                                    </p>
                                    <Link href="/patient/search">
                                        <Button className="mt-4" size="sm">
                                            <Search className="w-4 h-4 mr-2" />
                                            Buscar Psicólogo
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chat Window */}
                    <Card className="border-0 shadow-lg lg:col-span-2 flex flex-col overflow-hidden">
                        {selectedRoom ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-alma-lilac-100 bg-white">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={selectedRoom.psychologists.profiles.photo_url || undefined} />
                                            <AvatarFallback className="bg-alma-lilac-200">
                                                {selectedRoom.psychologists.profiles.full_name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium text-alma-blue-900">
                                                {selectedRoom.psychologists.profiles.full_name}
                                            </h4>
                                            <p className="text-xs text-green-600">Online</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto bg-alma-lilac-50/50">
                                    <div className="text-center py-8">
                                        <p className="text-sm text-alma-blue-900/40">
                                            Início da conversa com {selectedRoom.psychologists.profiles.full_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-alma-lilac-100 bg-white">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Digite sua mensagem..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleSendMessage} disabled={!message.trim()}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-alma-lilac-300" />
                                    <h3 className="text-lg font-medium text-alma-blue-900 mb-2">
                                        Selecione uma conversa
                                    </h3>
                                    <p className="text-sm text-alma-blue-900/60">
                                        Escolha um psicólogo na lista para iniciar o chat
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}
