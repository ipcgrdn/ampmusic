'use client';

import { useState, useCallback } from 'react';
import { User } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconX, IconChevronDown, IconCheck, IconUserPlus, IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { searchUsers } from '@/lib/api/user';

interface EditUserTagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  initialTaggedUsers: User[];  // 초기 태그된 사용자 목록
  disabled?: boolean;
}

export function EditUserTagInput({ 
  value, 
  onChange, 
  initialTaggedUsers,
  disabled 
}: EditUserTagInputProps) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(initialTaggedUsers);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsers(query);
      setSearchResults(results as User[]);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    }
  }, []);

  const handleSelect = useCallback((user: User) => {
    if (!value.includes(user.id)) {
      onChange([...value, user.id]);
      setSelectedUsers(prev => [...prev, user]);
    }
    setOpen(false);
  }, [value, onChange]);

  const handleRemove = useCallback((userId: string) => {
    onChange(value.filter(id => id !== userId));
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full h-12 justify-between bg-white/[0.03] border-white/10 
              hover:bg-white/[0.06] hover:border-white/20 rounded-xl group
              transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <IconUserPlus className="w-4 h-4 text-white/40 group-hover:text-white/60" />
              <span className="text-white/60 group-hover:text-white/80">
                사용자 태그하기...
              </span>
            </div>
            <IconChevronDown 
              className={cn(
                "w-4 h-4 shrink-0 text-white/40 group-hover:text-white/60 transition-transform duration-200",
                open && "transform rotate-180"
              )} 
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0 bg-black/90 border-white/10 backdrop-blur-xl"
          align="end"
          side="top"
          sideOffset={8}
        >
          <Command className="bg-transparent" shouldFilter={false}>
            <div className="flex items-center px-4 py-3 border-b border-white/[0.06]">
              <CommandInput 
                placeholder="사용자 검색..." 
                onValueChange={handleSearch}
                value={searchQuery}
                className="bg-transparent border-none focus:ring-0 
                  placeholder:text-white/40 text-white h-10"
              />
            </div>
            {searchQuery.length > 0 && searchResults.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto">
                  <IconUserPlus className="w-6 h-6 text-white/40" />
                </div>
                <div>
                  <p className="text-sm text-white/40">검색 결과가 없습니다</p>
                  <p className="text-xs text-white/30 mt-1">다른 검색어를 입력해보세요</p>
                </div>
              </div>
            ) : searchQuery.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto">
                  <IconSearch className="w-6 h-6 text-white/40" />
                </div>
                <div>
                  <p className="text-sm text-white/40">사용자 이름을 입력하세요</p>
                  <p className="text-xs text-white/30 mt-1">태그할 사용자를 검색할 수 있습니다</p>
                </div>
              </div>
            ) : (
              <CommandGroup className="p-2 max-h-[300px] overflow-y-auto">
                {searchResults.map(user => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(user)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg 
                      cursor-pointer hover:bg-white/[0.06] group/item"
                  >
                    <Avatar className="h-10 w-10 ring-1 ring-white/10 group-hover/item:ring-white/20">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback className="bg-white/[0.03] text-sm">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate group-hover/item:text-white">
                        {user.name}
                      </p>
                    </div>
                    <IconCheck className={cn(
                      "w-5 h-5 transition-all",
                      value.includes(user.id) 
                        ? "text-green-500 opacity-100" 
                        : "opacity-0 text-white/60"
                    )} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* 선택된 사용자 표시 */}
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map(user => (
          <Badge
            key={user.id}
            variant="secondary"
            className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] 
              border border-white/10 hover:border-white/20 group/badge"
          >
            <Avatar className="h-4 w-4 mr-2 ring-1 ring-white/10 
              group-hover/badge:ring-white/20">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="bg-white/[0.03] text-[10px]">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-white/80 group-hover/badge:text-white">
              {user.name}
            </span>
            <button
              className="ml-2 p-0.5 rounded-full hover:bg-white/10 
                transition-colors group/remove"
              onClick={() => handleRemove(user.id)}
              disabled={disabled}
            >
              <IconX className="h-3 w-3 text-white/40 
                group-hover/remove:text-white/80" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
} 