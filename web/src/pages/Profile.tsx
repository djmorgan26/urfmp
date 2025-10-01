import { useState } from 'react'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Building2,
  Shield,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export function Profile() {
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: 'David',
    lastName: 'Morgan',
    email: 'admin@urfmp.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Robotics Engineer',
    department: 'Engineering',
    organization: 'URFMP Demo',
    role: 'Administrator',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    // Load saved avatar from localStorage on mount
    return localStorage.getItem('urfmp_user_avatar')
  })
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsChangingPassword(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      // Create a preview URL using FileReader
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setAvatarUrl(imageUrl)
        // Save to localStorage for persistence across the app
        localStorage.setItem('urfmp_user_avatar', imageUrl)

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatarUrl: imageUrl } }))
      }
      reader.readAsDataURL(file)

      // TODO: Upload to server when API endpoint is ready
      // const formData = new FormData()
      // formData.append('avatar', file)
      // const response = await fetch('/api/v1/users/me/avatar', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('urfmp_access_token')}`
      //   },
      //   body: formData
      // })
      // const data = await response.json()
      // setAvatarUrl(data.avatarUrl)
      // localStorage.setItem('urfmp_user_avatar', data.avatarUrl)

      toast.success('Profile picture updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile picture. Please try again.')
      console.error('Avatar upload error:', error)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile picture"
                className="h-24 w-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-medium">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className={cn(
                'absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors',
                isUploadingAvatar && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Camera className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isUploadingAvatar
                ? 'Uploading...'
                : 'Upload a new avatar. Max size 5MB. Supports JPG, PNG, GIF.'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleProfileUpdate} className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-1" />
              First Name
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Last Name
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <UserCircle className="h-4 w-4 inline mr-1" />
              Job Title
            </label>
            <input
              type="text"
              value={profileData.jobTitle}
              onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Department
            </label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Organization & Role (Read-only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Organization
            </label>
            <input
              type="text"
              value={profileData.organization}
              className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Contact your administrator to change organization
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Shield className="h-4 w-4 inline mr-1" />
              Role
            </label>
            <input
              type="text"
              value={profileData.role}
              className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Contact your administrator to change role
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors',
              isSaving && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ensure your password is at least 8 characters long and includes a mix of letters, numbers,
          and symbols.
        </p>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isChangingPassword}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors',
              isChangingPassword && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Lock className="h-4 w-4" />
            <span>{isChangingPassword ? 'Changing Password...' : 'Change Password'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
