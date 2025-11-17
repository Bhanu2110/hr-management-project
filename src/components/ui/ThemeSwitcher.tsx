import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { setThemeColor, themeMode, setThemeMode } = useTheme();

  const colors = {
    Orange: '#E15B55',
    Blue: '#3B82F6',
    Green: '#10B981',
    Purple: '#8B5CF6',
    Black: '#000000',
    Red: '#EF4444',
    Pink: '#EC4899',
    Grey: '#6B7280',
    Indigo: '#6366F1',
    Teal: '#14B8A6',
    Cyan: '#06B6D4',
    Lime: '#84CC16',
    Amber: '#F59E0B',
    Rose: '#F43F5E',
    Slate: '#64748B',
    "Deep Teal": '#008080',
    "Earth Brown": '#8B4513',
     // Placeholder green
    Practipago: '#2196F3',   // Placeholder blue
    YouEngage: '#FF9800',    // Placeholder orange
    KeyNest: '#BF3436',
    
    "Melyssa Griffin": '#FF6B6B',
    "Lemon Tree Editorial": '#7CB342', // Placeholder green
    "Katie Lemon": '#FFD700',      // Placeholder gold
      // Placeholder purple
    Scarlet: '#FF2400',            // Placeholder scarlet red
    CitrusAd: '#FFA500',           // Placeholder orange
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto w-56">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 p-1">
          {Object.entries(colors).map(([name, color]) => (
            <DropdownMenuItem key={name} onClick={() => setThemeColor(color)} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full mr-2 border"
                style={{ backgroundColor: color }}
              ></span>
              <span className="truncate">{name}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Interface Theme</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setThemeMode('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeMode('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
