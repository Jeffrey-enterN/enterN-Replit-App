import { useState } from "react";
import { Moon, Sun, Laptop, Bell } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useNotificationSettings } from "@/context/notification-settings-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export function SettingsDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useNotificationSettings();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Theme</h4>
              <RadioGroup
                defaultValue={theme}
                onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="theme-light"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="theme-light"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground",
                      theme === "light" && "border-primary"
                    )}
                  >
                    <Sun className="mb-2 h-6 w-6" />
                    Light
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="theme-dark"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="theme-dark"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white dark:bg-gray-950 p-4 hover:bg-accent hover:text-accent-foreground",
                      theme === "dark" && "border-primary"
                    )}
                  >
                    <Moon className="mb-2 h-6 w-6" />
                    Dark
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="system"
                    id="theme-system"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="theme-system"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground",
                      theme === "system" && "border-primary"
                    )}
                  >
                    <Laptop className="mb-2 h-6 w-6" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Push notifications</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive notifications for new matches in the browser
                  </span>
                </Label>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ pushNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email notifications</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive email notifications for new matches and messages
                  </span>
                </Label>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ emailNotifications: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}