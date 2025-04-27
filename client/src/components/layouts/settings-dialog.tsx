import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { useNotificationSettings } from '@/context/notification-settings-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function SettingsDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useNotificationSettings();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Theme</h4>
            <div className="flex space-x-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-1" /> Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-1" /> Dark
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Notifications</h4>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="push-notifications">Push notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => 
                  updateSettings({ pushNotifications: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications">Email notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  updateSettings({ emailNotifications: checked })
                }
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}