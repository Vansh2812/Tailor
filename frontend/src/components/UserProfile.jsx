import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/badge';
import { User, Languages, Lock, CheckCircle } from 'lucide-react';
import '../i18n';

// ✅ Environment variable for API base
const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function UserProfile() {
  const { t, i18n } = useTranslation();

  const [userSettings, setUserSettings] = useState({ language: i18n.language || 'english' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user info from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/all`);
        const data = await res.json();

        if (data?.users?.length > 0) {
          const user = data.users[0];
          setUserEmail(user.email);
          const lang = user.language || localStorage.getItem('lang') || 'english';
          setUserSettings({ language: lang });
          i18n.changeLanguage(lang);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        showMessage(t('loadError') || 'Failed to load user data', 'error');
      }
    };

    fetchUserData();
  }, [i18n, t]);

  const showMessage = (msg, type = 'success', duration = 3000) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), duration);
  };

  const handleLanguageChange = async (language) => {
    setUserSettings({ language });
    i18n.changeLanguage(language);
    localStorage.setItem('lang', language);

    try {
      const res = await fetch(`${API_BASE}/api/auth/update-language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, language })
      });

      if (!res.ok) throw new Error('Failed to update language');

      showMessage(
        language === 'english'
          ? t('languageChangedEn') || 'Language changed to English'
          : t('languageChangedGu') || 'ભાષા ગુજરાતી કરી દેવાઈ',
        'success'
      );
    } catch (err) {
      console.error(err);
      showMessage(t('updateLanguageError') || 'Failed to update language', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage(t('fillAllFields') || 'Please fill all password fields', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage(t('passwordLength') || 'New password must be at least 6 characters long', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage(t('passwordMismatch') || 'New passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || t('passwordChangeFailed') || 'Password change failed', 'error');
        return;
      }

      showMessage(t('passwordChanged') || 'Password changed successfully', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      showMessage(t('passwordChangeFailed') || 'Password change failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {t('userProfile') || 'User Profile & Settings'}
        </h2>
        <p className="text-gray-600">
          {t('manageAccount') || 'Manage your account settings and preferences'}
        </p>
      </div>

      {message && (
        <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CheckCircle className={`w-4 h-4 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Info & Language Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('profileInfo') || 'Profile Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('emailAddress') || 'Email Address'}</Label>
              <div className="flex items-center gap-2">
                <Input value={userEmail} disabled />
                <Badge variant="secondary">Admin</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('accountType') || 'Account Type'}</Label>
              <Input value={t('administrator') || 'Administrator'} disabled />
            </div>

            <div className="space-y-2">
              <Label>{t('lastLogin') || 'Last Login'}</Label>
              <Input value={new Date().toLocaleDateString()} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              {t('languageSettings') || 'Language Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('selectLanguage') || 'Select Language'}</Label>
              <Select value={userSettings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">{t('english') || 'English'}</SelectItem>
                  <SelectItem value="gujarati">{t('gujarati') || 'ગુજરાતી'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                {t('currentLanguage') || 'Current Language'}:{' '}
                <span className="font-medium">
                  {userSettings.language === 'english'
                    ? t('english') || 'English'
                    : t('gujarati') || 'ગુજરાતી'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t('changePassword') || 'Change Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">{t('currentPassword') || 'Current Password'}</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder={t('enterCurrentPassword') || 'Enter current password'}
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword') || 'New Password'}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t('enterNewPassword') || 'Enter new password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword') || 'Confirm New Password'}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('reEnterPassword') || 'Re-enter new password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={loading}>
              {loading ? t('updating') || 'Updating...' : t('updatePassword') || 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
