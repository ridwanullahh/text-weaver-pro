
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { wrappedSDK } from '@/services/sdkService';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save
} from 'lucide-react';

const UserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: false,
      marketing: false
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      autoSave: true,
      qualityCheck: true
    }
  });

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await wrappedSDK.update('users', user.id, {
        fullName: settings.fullName,
        settings: {
          notifications: settings.notifications,
          preferences: settings.preferences
        }
      });

      toast({
        title: "Settings Saved! ✅",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Settings className="w-8 h-8" />
          Account Settings
        </h1>
        <p className="text-white/60 text-lg">
          Customize your TextWeaver Pro experience
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                value={settings.fullName}
                onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                value={settings.email}
                disabled
                className="bg-white/5 border-white/10 text-white/70"
              />
              <p className="text-white/50 text-xs mt-1">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-white/60 text-sm">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(value) => updateSetting('notifications', 'email', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Push Notifications</Label>
                <p className="text-white/60 text-sm">Browser notifications</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(value) => updateSetting('notifications', 'push', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Marketing Emails</Label>
                <p className="text-white/60 text-sm">Promotions and features</p>
              </div>
              <Switch
                checked={settings.notifications.marketing}
                onCheckedChange={(value) => updateSetting('notifications', 'marketing', value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto-Save Projects</Label>
                <p className="text-white/60 text-sm">Automatically save your work</p>
              </div>
              <Switch
                checked={settings.preferences.autoSave}
                onCheckedChange={(value) => updateSetting('preferences', 'autoSave', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Quality Check</Label>
                <p className="text-white/60 text-sm">Enable quality assessments</p>
              </div>
              <Switch
                checked={settings.preferences.qualityCheck}
                onCheckedChange={(value) => updateSetting('preferences', 'qualityCheck', value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Change Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8"
        >
          {isLoading ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default UserSettings;
