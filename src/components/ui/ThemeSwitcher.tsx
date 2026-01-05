import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { setThemeColor, themeMode, setThemeMode } = useTheme();

  const colors = {
    "Coral Red": '#E15B55',
    Orange:'#F46A1F',
    Blue: '#3B82F6',
    Green: '#04704cff',
    Indigo: '#6366F1',
    Cyan: '#086bbdff',
    "Deep Teal": '#008080',
    Practipago: '#2196F3',  
    KeyNest: '#f75f07ff',
   "Sap Green" : '#2F6B3C',
    "Ocean Blue":'#0077B6',
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
