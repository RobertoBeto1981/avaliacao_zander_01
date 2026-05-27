import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatSidebar({ users, groups, activeContact, onSelectContact }: any) {
  return (
    <div className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col rounded-l-lg">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-bold text-white">Conversas</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          <div>
            <p className="px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Grupos
            </p>
            <div className="space-y-1">
              {groups.map((group: any) => (
                <button
                  key={group.id}
                  onClick={() => onSelectContact(group)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border',
                    activeContact?.id === group.id
                      ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                      : 'border-transparent hover:bg-zinc-800/50 text-zinc-300',
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                      activeContact?.id === group.id ? 'bg-[#84cc16]/20' : 'bg-zinc-800',
                    )}
                  >
                    <Users
                      className={cn(
                        'w-4 h-4',
                        activeContact?.id === group.id ? 'text-[#84cc16]' : 'text-zinc-400',
                      )}
                    />
                  </div>
                  <span className="font-medium text-sm text-left truncate">{group.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Contatos
            </p>
            <div className="space-y-1">
              {users.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() =>
                    onSelectContact({ id: user.id, name: user.nome, type: 'user', role: user.role })
                  }
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border',
                    activeContact?.id === user.id
                      ? 'bg-zinc-800 border-zinc-700 text-white shadow-sm'
                      : 'border-transparent hover:bg-zinc-800/50 text-zinc-300',
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                      activeContact?.id === user.id ? 'bg-[#84cc16]/20' : 'bg-zinc-800',
                    )}
                  >
                    <User
                      className={cn(
                        'w-4 h-4',
                        activeContact?.id === user.id ? 'text-[#84cc16]' : 'text-zinc-400',
                      )}
                    />
                  </div>
                  <div className="flex flex-col items-start truncate text-left">
                    <span className="font-medium text-sm truncate w-full">{user.nome}</span>
                    <span className="text-[11px] text-zinc-500 capitalize">{user.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
