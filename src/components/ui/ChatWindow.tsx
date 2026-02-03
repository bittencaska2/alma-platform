'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Check, CheckCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
    id: string
    room_id: string
    sender_id: string
    content: string
    is_read: boolean
    sent_at: string
    read_at?: string | null
}

interface ChatWindowProps {
    roomId: string
    currentUserId: string
    otherUser: {
        id: string
        name: string
        photoUrl?: string | null
    }
    initialMessages?: Message[]
    hasActivePackage?: boolean
}

export function ChatWindow({
    roomId,
    currentUserId,
    otherUser,
    initialMessages = [],
    hasActivePackage = true
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const otherInitials = otherUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Subscribe to real-time messages
    useEffect(() => {
        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })

                    // Mark as read if from other user
                    if (newMsg.sender_id !== currentUserId) {
                        markAsRead(newMsg.id)
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    const updatedMsg = payload.new as Message
                    setMessages(prev =>
                        prev.map(m => m.id === updatedMsg.id ? updatedMsg : m)
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, currentUserId, supabase])

    // Mark message as read
    const markAsRead = async (messageId: string) => {
        await supabase
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', messageId)
    }

    // Send message
    const handleSend = async () => {
        if (!newMessage.trim() || isSending || !hasActivePackage) return

        setIsSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        // Optimistic update
        const optimisticMsg: Message = {
            id: `temp-${Date.now()}`,
            room_id: roomId,
            sender_id: currentUserId,
            content,
            is_read: false,
            sent_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    room_id: roomId,
                    sender_id: currentUserId,
                    content
                })
                .select()
                .single()

            if (error) throw error

            // Replace optimistic message with real one
            setMessages(prev =>
                prev.map(m => m.id === optimisticMsg.id ? data : m)
            )

            // Update chat room last_message_at
            await supabase
                .from('chat_rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', roomId)

        } catch (err) {
            console.error('Error sending message:', err)
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
            setNewMessage(content) // Restore message
        } finally {
            setIsSending(false)
        }
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Hoje'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem'
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
            })
        }
    }

    // Group messages by date
    const groupedMessages: { date: string; messages: Message[] }[] = []
    let currentDate = ''

    messages.forEach(msg => {
        const msgDate = new Date(msg.sent_at).toDateString()
        if (msgDate !== currentDate) {
            currentDate = msgDate
            groupedMessages.push({ date: msg.sent_at, messages: [msg] })
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg)
        }
    })

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-alma-lilac-100 bg-white flex items-center gap-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={otherUser.photoUrl || undefined} />
                    <AvatarFallback className="bg-alma-lilac-200">
                        {otherInitials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-medium text-alma-blue-900">{otherUser.name}</h4>
                    <p className="text-xs text-green-600">Online</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-alma-lilac-50/30 to-white space-y-4">
                {groupedMessages.length === 0 ? (
                    <div className="text-center py-8 text-alma-blue-900/50">
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Comece a conversa!</p>
                    </div>
                ) : (
                    groupedMessages.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            {/* Date separator */}
                            <div className="flex items-center justify-center my-4">
                                <span className="px-3 py-1 bg-alma-lilac-100 text-alma-blue-900/60 text-xs rounded-full">
                                    {formatDate(group.date)}
                                </span>
                            </div>

                            {/* Messages */}
                            {group.messages.map((msg) => {
                                const isMine = msg.sender_id === currentUserId

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine
                                                    ? 'bg-alma-blue-900 text-white rounded-br-md'
                                                    : 'bg-white border border-alma-lilac-200 text-alma-blue-900 rounded-bl-md shadow-sm'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {msg.content}
                                            </p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/60' : 'text-alma-blue-900/40'
                                                }`}>
                                                <span className="text-[10px]">{formatTime(msg.sent_at)}</span>
                                                {isMine && (
                                                    msg.is_read ? (
                                                        <CheckCheck className="w-3 h-3 text-blue-300" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {hasActivePackage ? (
                <div className="p-4 border-t border-alma-lilac-100 bg-white">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Digite sua mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            disabled={isSending}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || isSending}
                            size="icon"
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-t border-alma-lilac-100 bg-amber-50 text-center">
                    <p className="text-sm text-amber-800">
                        Chat disponível apenas para pacientes com pacote ativo.
                    </p>
                </div>
            )}
        </div>
    )
}
