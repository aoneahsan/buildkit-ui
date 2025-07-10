import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useTracking } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

export interface ProfilePageProps {
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    username?: string;
    joinDate?: Date;
    isVerified?: boolean;
  };
  onUpdate?: (data: any) => Promise<void>;
  onLogout?: () => void;
  onChangePassword?: () => void;
  onDeleteAccount?: () => void;
  editable?: boolean;
  className?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user = {},
  onUpdate,
  onLogout,
  onChangePassword,
  onDeleteAccount,
  editable = true,
  className,
}) => {
  const { t } = useTranslation();
  const { trackEvent } = useTracking({ componentType: 'ProfilePage' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    username: user.username || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    trackEvent('profile_edit_start');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      username: user.username || '',
    });
    setErrors({});
    trackEvent('profile_edit_cancel');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = t('auth.errors.nameRequired');
    }
    
    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      trackEvent('profile_update_validation_failed');
      return;
    }

    setLoading(true);
    trackEvent('profile_update_attempt');

    try {
      await onUpdate?.(formData);
      setIsEditing(false);
      trackEvent('profile_update_success');
    } catch (error) {
      trackEvent('profile_update_error', { error: (error as Error).message });
      setErrors({ form: t('profile.errors.updateFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    trackEvent('profile_avatar_change', { 
      fileSize: file.size,
      fileType: file.type 
    });

    try {
      // Handle avatar upload
      trackEvent('profile_avatar_success');
    } catch (error) {
      trackEvent('profile_avatar_error', { error: (error as Error).message });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('profile.title')}
            </h1>
            {!isEditing && editable && (
              <Button
                variant="primary"
                onClick={handleEdit}
                icon="pi pi-pencil"
              >
                {t('profile.edit')}
              </Button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="pi pi-user text-4xl text-gray-400"></i>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-buildkit-500 text-white p-2 rounded-full cursor-pointer hover:bg-buildkit-600 transition-colors"
                  >
                    <i className="pi pi-camera text-sm"></i>
                  </label>
                </>
              )}
              {avatarLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <i className="pi pi-spin pi-spinner text-white"></i>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.name || t('profile.noName')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
              {user.isVerified && (
                <div className="flex items-center mt-1">
                  <i className="pi pi-check-circle text-green-500 mr-1"></i>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {t('profile.verified')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('profile.fields.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                disabled={!isEditing}
                fullWidth
              />

              <Input
                label={t('profile.fields.username')}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                fullWidth
              />

              <Input
                type="email"
                label={t('profile.fields.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                disabled={!isEditing}
                fullWidth
              />

              <Input
                type="tel"
                label={t('profile.fields.phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                fullWidth
              />
            </div>

            <Input
              label={t('profile.fields.bio')}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              fullWidth
              maxLength={200}
              showCount={isEditing}
              helperText={isEditing ? t('profile.helpers.bio') : undefined}
            />

            {errors.form && (
              <p className="text-sm text-red-600">{errors.form}</p>
            )}

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={loading}
                  loadingText={t('common.saving')}
                >
                  {t('common.save')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('profile.accountInfo')}
          </h3>
          
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">
                {t('profile.memberSince')}
              </dt>
              <dd className="text-gray-900 dark:text-white">
                {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '-'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">
                {t('profile.accountStatus')}
              </dt>
              <dd className="text-gray-900 dark:text-white">
                {user.isVerified ? t('profile.active') : t('profile.unverified')}
              </dd>
            </div>
          </dl>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('profile.accountActions')}
          </h3>
          
          <div className="space-y-3">
            {onChangePassword && (
              <Button
                variant="secondary"
                fullWidth
                onClick={onChangePassword}
                icon="pi pi-lock"
              >
                {t('profile.changePassword')}
              </Button>
            )}
            
            {onLogout && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  trackEvent('profile_logout');
                  onLogout();
                }}
                icon="pi pi-sign-out"
              >
                {t('profile.logout')}
              </Button>
            )}
            
            {onDeleteAccount && (
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  trackEvent('profile_delete_start');
                  onDeleteAccount();
                }}
                icon="pi pi-trash"
              >
                {t('profile.deleteAccount')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};