import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { SmilePlus } from 'lucide-react'

const COMMON_EMOJIS = [
  '😀',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🥰',
  '😘',
  '😜',
  '🤪',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👿',
  '👹',
  '👺',
  '🤡',
  '💩',
  '👻',
  '💀',
  '☠️',
  '👽',
  '👾',
  '🤖',
  '🎃',
  '😺',
  '😸',
  '😹',
  '😻',
  '😼',
  '😽',
  '🙀',
  '😿',
  '😾',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '🤍',
  '🤎',
  '💔',
  '❣️',
  '💕',
  '💞',
  '💓',
  '💗',
  '💖',
  '💘',
  '💝',
  '💟',
  '☮️',
  '✝️',
  '💪',
  '🏋️',
  '🏃',
  '🤸',
  '🚴',
  '🎯',
  '🏆',
  '🏅',
  '🥇',
  '🥈',
  '🥉',
  '🔥',
  '✨',
  '🌟',
  '💫',
  '💥',
  '💯',
  '✅',
  '❌',
  '⚠️',
  '🛑',
  '👍',
  '👎',
  '👏',
  '🙌',
  '👐',
  '🤝',
  '🙏',
]

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          type="button"
          className={className || 'h-9 w-9 shrink-0 text-muted-foreground hover:text-primary'}
          title="Inserir Emoji"
        >
          <SmilePlus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-2 border-border/50 shadow-lg"
        align="start"
        sideOffset={4}
      >
        <div className="grid grid-cols-8 gap-1 max-h-[220px] overflow-y-auto p-1">
          {COMMON_EMOJIS.map((emoji, i) => (
            <button
              key={i}
              type="button"
              className="h-7 w-7 text-lg hover:bg-primary/10 hover:scale-110 rounded flex items-center justify-center transition-all cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                onEmojiSelect(emoji)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
