'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/app/contexts/UserContext'
import Link from 'next/link'
import LanguageToggle from '@/app/components/LanguageToggle'

interface User {
  id: string
  email: string
  name: string
  type: 'student' | 'mentor'
  active: boolean
  blocked: boolean
  expertise: string[]
  mbti: string
}

interface Featured {
  id: string
  title: string
  description: string
  badge: string
  link: string
  linkText: string
  active: boolean
}

interface Ad {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
  active: boolean
}

export default function AdminPage() {
  const { user: adminUser, setUser: setAdminUser } = useUser()
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'featured' | 'ads'>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [featured, setFeatured] = useState<Featured[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Search & filter states
  const [userSearch, setUserSearch] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'student' | 'mentor'>('all')

  // Modals
  const [featuredModal, setFeaturedModal] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    id?: string
    title: string
    description: string
    badge: string
    link: string
    linkText: string
    active: boolean
  }>({
    isOpen: false,
    mode: 'create',
    title: '',
    description: '',
    badge: '',
    link: '',
    linkText: '',
    active: true,
  })

  const [adModal, setAdModal] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    id?: string
    title: string
    description: string
    imageUrl: string
    link: string
    active: boolean
  }>({
    isOpen: false,
    mode: 'create',
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    active: true,
  })

  const [deleteUserModal, setDeleteUserModal] = useState<{
    isOpen: boolean
    userId: string | null
    userName: string
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  })

  // Redirect if not admin
  useEffect(() => {
    if (adminUser && adminUser.type !== 'admin') {
      window.location.href = '/'
    }
  }, [adminUser])

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      // Users
      const usersRes = await fetch('/api/admin/users')
      if (!usersRes.ok) throw new Error('Failed to fetch users')
      const usersData = await usersRes.json()
      setUsers(usersData.users || [])

      // Featured content
      const featRes = await fetch('/api/admin/featured')
      if (!featRes.ok) throw new Error('Failed to fetch featured content')
      const featData = await featRes.json()
      setFeatured(featData.featured || [])

      // Ads
      const adsRes = await fetch('/api/admin/ads')
      if (!adsRes.ok) throw new Error('Failed to fetch ads')
      const adsData = await adsRes.json()
      setAds(adsData.ads || [])

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (adminUser?.type === 'admin') {
      fetchData()
    }
  }, [adminUser])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // User Action Handlers
  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-block', userId }),
      })
      if (!res.ok) throw new Error('Failed to toggle block status')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !currentBlocked } : u))
      showSuccess(currentBlocked ? 'Student unblocked successfully' : 'Student blocked successfully')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-active', userId }),
      })
      if (!res.ok) throw new Error('Failed to toggle mentor activation')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentActive } : u))
      showSuccess(currentActive ? 'Mentor account deactivated' : 'Mentor account activated')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDeleteUser = async () => {
    const { userId } = deleteUserModal
    if (!userId) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId }),
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setUsers(prev => prev.filter(u => u.id !== userId))
      setDeleteUserModal({ isOpen: false, userId: null, userName: '' })
      showSuccess('User account deleted permanently')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Featured Content Handlers
  const handleSaveFeatured = async (e: React.FormEvent) => {
    e.preventDefault()
    const { mode, id, title, description, badge, link, linkText, active } = featuredModal
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'create' ? 'create' : 'update',
          id,
          title,
          description,
          badge,
          link,
          linkText,
          active,
        }),
      })
      if (!res.ok) throw new Error('Failed to save featured content')
      showSuccess(mode === 'create' ? 'Featured content created successfully' : 'Featured content updated')
      setFeaturedModal(prev => ({ ...prev, isOpen: false }))
      fetchData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDeleteFeatured = async (id: string) => {
    if (!confirm('Are you sure you want to delete this featured item?')) return
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      if (!res.ok) throw new Error('Failed to delete item')
      showSuccess('Featured content deleted')
      fetchData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleToggleFeaturedActive = async (item: Featured) => {
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: item.id,
          active: !item.active,
        }),
      })
      if (!res.ok) throw new Error('Failed to toggle active status')
      showSuccess(item.active ? 'Featured item disabled' : 'Featured item enabled')
      fetchData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Ad Handlers
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault()
    const { mode, id, title, description, imageUrl, link, active } = adModal
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'create' ? 'create' : 'update',
          id,
          title,
          description,
          imageUrl,
          link,
          active,
        }),
      })
      if (!res.ok) throw new Error('Failed to save ad')
      showSuccess(mode === 'create' ? 'Sponsored ad created successfully' : 'Ad banner updated')
      setAdModal(prev => ({ ...prev, isOpen: false }))
      fetchData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsored ad banner?')) return
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      if (!res.ok) throw new Error('Failed to delete ad')
      showSuccess('Sponsored ad banner deleted')
      fetchData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleToggleAdActive = async (item: Ad) => {
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: item.id,
          active: !item.active,
        }),
      })
      if (!res.ok) throw new Error('Failed to toggle active status')
      showSuccess(item.active ? 'Ad banner disabled' : 'Ad banner enabled')
      fetchData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
    } catch {
      // Clear client session anyway
    } finally {
      setAdminUser(null)
      window.location.href = '/'
    }
  }

  if (!adminUser || adminUser.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You must be logged in as admin to access this page.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-bold">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const query = userSearch.toLowerCase().trim()
    const matchesQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    const matchesType = userTypeFilter === 'all' || u.type === userTypeFilter
    return matchesQuery && matchesType
  })

  // Overview calculations
  const totalStudents = users.filter(u => u.type === 'student').length
  const totalMentors = users.filter(u => u.type === 'mentor').length
  const activeFeats = featured.filter(f => f.active).length
  const activeAdsCount = ads.filter(a => a.active).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 shadow-sm transform transition-transform duration-300
        md:static md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xl font-bold text-[#112954]">
              <span>🚀</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Admin Portal</p>
          
          <nav className="mt-8 space-y-1">
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => { setActiveTab('users'); setSidebarOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => { setActiveTab('featured'); setSidebarOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'featured'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              📢 Featured Announcements
            </button>
            <button
              onClick={() => { setActiveTab('ads'); setSidebarOpen(false) }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'ads'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              🏷️ Sponsored Ads
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 truncate max-w-[140px]">{adminUser.name || adminUser.email}</span>
            <LanguageToggle variant="light" compact />
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 border border-red-200 text-red-600 font-bold hover:bg-red-50 transition rounded-xl text-sm text-center"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="font-bold text-[#112954] text-sm">Admin Portal</span>
          <LanguageToggle variant="light" compact />
        </header>

      {/* Main container */}
      <main className="flex-grow p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Banner notifications */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 font-semibold rounded-2xl flex items-center justify-between gap-3 text-sm animate-fade-in shadow-sm">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="hover:text-rose-800">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 font-semibold rounded-2xl flex items-center justify-between gap-3 text-sm animate-fade-in shadow-sm">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="hover:text-emerald-800">✕</button>
          </div>
        )}

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#112954]">Dashboard Overview</h1>
              <p className="text-gray-500 text-sm mt-1">Platform analytics and administrative shortcuts.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Students</span>
                <span className="text-4xl font-extrabold text-blue-600 mt-4">{totalStudents}</span>
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Mentors</span>
                <span className="text-4xl font-extrabold text-indigo-600 mt-4">{totalMentors}</span>
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Featured Items</span>
                <span className="text-4xl font-extrabold text-emerald-600 mt-4">{activeFeats} <span className="text-sm font-medium text-gray-400">/ {featured.length}</span></span>
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Sponsored Ads</span>
                <span className="text-4xl font-extrabold text-pink-600 mt-4">{activeAdsCount} <span className="text-sm font-medium text-gray-400">/ {ads.length}</span></span>
              </div>
            </div>

            {/* Shortcuts Panel */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
              <h2 className="text-lg font-extrabold text-[#112954] mb-4">Quick Management Links</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-[#112954] hover:text-blue-600 font-bold rounded-2xl text-left transition"
                >
                  <p className="text-lg">👥 Manage Users</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Review registrations, activate/deactivate accounts.</p>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('featured');
                    setFeaturedModal({
                      isOpen: true,
                      mode: 'create',
                      title: '',
                      description: '',
                      badge: 'NEW',
                      link: '',
                      linkText: '',
                      active: true,
                    });
                  }}
                  className="p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 text-[#112954] hover:text-emerald-600 font-bold rounded-2xl text-left transition"
                >
                  <p className="text-lg">📢 Add Announcement</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Publish news updates to the homepage landing screen.</p>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('ads');
                    setAdModal({
                      isOpen: true,
                      mode: 'create',
                      title: '',
                      description: '',
                      imageUrl: '',
                      link: '',
                      active: true,
                    });
                  }}
                  className="p-4 bg-gray-50 hover:bg-pink-50 border border-gray-100 hover:border-pink-200 text-[#112954] hover:text-pink-600 font-bold rounded-2xl text-left transition"
                >
                  <p className="text-lg">🏷️ Post Sponsor Ad</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Maintain advertising campaigns & custom links.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USERS PANEL */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#112954]">User Directory</h1>
                <p className="text-gray-500 text-sm mt-1">Manage accounts, monitor roles, and edit blocklists.</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full sm:max-w-md bg-slate-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 transition"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setUserTypeFilter('all')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                    userTypeFilter === 'all'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setUserTypeFilter('student')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                    userTypeFilter === 'student'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Students Only
                </button>
                <button
                  onClick={() => setUserTypeFilter('mentor')}
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                    userTypeFilter === 'mentor'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Mentors Only
                </button>
              </div>
            </div>

            {/* Users list/table */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="py-20 text-center text-gray-400 font-bold">Loading directory data...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-bold">No users match your criteria</div>
              ) : (
                <>
                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 truncate">{u.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-400 font-semibold truncate">{u.email}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          u.type === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {u.type === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Mentor'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {u.type === 'student' ? (
                          u.mbti ? (
                            <span className="font-bold">MBTI: <strong className="text-indigo-600">{u.mbti}</strong></span>
                          ) : (
                            <span className="font-semibold">No assessment taken</span>
                          )
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.expertise.slice(0, 3).map(exp => (
                              <span key={exp} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">{exp}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {u.type === 'student' ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {u.blocked ? 'Blocked' : 'Active'}
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.active ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {u.active ? 'Activated' : 'Pending Approval'}
                          </span>
                        )}
                        <div className="flex gap-2 flex-wrap justify-end">
                          {u.type === 'student' ? (
                            <button
                              onClick={() => handleToggleBlock(u.id, u.blocked)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                u.blocked
                                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                  : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              {u.blocked ? 'Unblock' : 'Block'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(u.id, u.active)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                u.active
                                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteUserModal({ isOpen: true, userId: u.id, userName: u.name || u.email })}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Details</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{u.name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-400 font-semibold">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.type === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                              {u.type === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Mentor'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.type === 'student' ? (
                              u.mbti ? (
                                <span className="text-xs font-bold text-gray-500">MBTI: <strong className="text-indigo-600">{u.mbti}</strong></span>
                              ) : (
                                <span className="text-xs text-gray-400 font-semibold">No assessment taken</span>
                              )
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[180px]">
                                {u.expertise.slice(0, 2).map(exp => (
                                  <span key={exp} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">{exp}</span>
                                ))}
                                {u.expertise.length > 2 && <span className="text-[10px] text-gray-400 font-bold">+{u.expertise.length - 2} more</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {u.type === 'student' ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                u.blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {u.blocked ? 'Blocked' : 'Active'}
                              </span>
                            ) : (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                u.active ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {u.active ? 'Activated' : 'Pending Approval'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            {u.type === 'student' ? (
                              <button
                                onClick={() => handleToggleBlock(u.id, u.blocked)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                                  u.blocked
                                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                    : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                {u.blocked ? 'Unblock' : 'Block'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleActive(u.id, u.active)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                                  u.active
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {u.active ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteUserModal({ isOpen: true, userId: u.id, userName: u.name || u.email })}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* FEATURED PANEL */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#112954]">Featured Content</h1>
                <p className="text-gray-500 text-sm mt-1">Manage announcements, news headers, and CTA banners on the homepage.</p>
              </div>
              <button
                onClick={() => setFeaturedModal({
                  isOpen: true,
                  mode: 'create',
                  title: '',
                  description: '',
                  badge: 'NEW',
                  link: '',
                  linkText: '',
                  active: true,
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-md text-sm transition transform hover:scale-102 cursor-pointer"
              >
                + Create Announcement
              </button>
            </div>

            {/* List items */}
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-bold">Loading announcements...</div>
            ) : featured.length === 0 ? (
              <div className="bg-white border border-gray-100 p-12 text-center rounded-3xl shadow-sm text-gray-400 font-semibold">
                No featured items created yet. Click &quot;+ Create Announcement&quot; above to add one!
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {featured.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        {item.badge && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider">{item.badge}</span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {item.active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{item.description}</p>
                      {item.link && (
                        <div className="mt-3 text-xs text-blue-500 font-bold truncate">
                          Link: <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{item.linkText || item.link}</a>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-6">
                      <button
                        onClick={() => handleToggleFeaturedActive(item)}
                        className={`text-xs font-bold transition ${
                          item.active ? 'text-gray-400 hover:text-gray-600' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {item.active ? 'Disable' : 'Enable'}
                      </button>
                      <div className="space-x-3">
                        <button
                          onClick={() => setFeaturedModal({
                            isOpen: true,
                            mode: 'edit',
                            id: item.id,
                            title: item.title,
                            description: item.description,
                            badge: item.badge,
                            link: item.link,
                            linkText: item.linkText,
                            active: item.active,
                          })}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeatured(item.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADS PANEL */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3.5xl font-extrabold text-[#112954]">Sponsored Ads</h1>
                <p className="text-gray-500 text-sm mt-1">Maintain sponsor ads, placements, images, and external referral campaigns.</p>
              </div>
              <button
                onClick={() => setAdModal({
                  isOpen: true,
                  mode: 'create',
                  title: '',
                  description: '',
                  imageUrl: '',
                  link: '',
                  active: true,
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-md text-sm transition transform hover:scale-102 cursor-pointer"
              >
                + Create Ad Banner
              </button>
            </div>

            {/* List Ads */}
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-bold">Loading ad data...</div>
            ) : ads.length === 0 ? (
              <div className="bg-white border border-gray-100 p-12 text-center rounded-3xl shadow-sm text-gray-400 font-semibold">
                No sponsored ad campaigns running. Click &quot;+ Create Ad Banner&quot; above to add one!
              </div>
            ) : (
              <div className="space-y-4">
                {ads.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row gap-5 items-start md:items-center flex-grow">
                      {item.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.imageUrl} alt={item.title} className="h-16 w-32 object-contain bg-slate-50 border border-gray-100 rounded-xl" />
                      ) : (
                        <div className="h-16 w-32 flex items-center justify-center bg-gray-50 text-gray-300 text-xs font-bold rounded-xl border border-gray-100">No Image</div>
                      )}
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="px-1.5 py-0.5 border border-gray-300 text-gray-400 rounded text-[9px] font-extrabold uppercase">Ad</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {item.active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{item.description}</p>
                        {item.link && (
                          <p className="text-[10px] text-blue-500 font-semibold mt-1 truncate max-w-sm">Link: <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline">{item.link}</a></p>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
                      <button
                        onClick={() => handleToggleAdActive(item)}
                        className={`text-xs font-bold transition ${
                          item.active ? 'text-gray-400 hover:text-gray-600' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {item.active ? 'Disable Ad' : 'Enable Ad'}
                      </button>
                      <div className="space-x-3">
                        <button
                          onClick={() => setAdModal({
                            isOpen: true,
                            mode: 'edit',
                            id: item.id,
                            title: item.title,
                            description: item.description,
                            imageUrl: item.imageUrl,
                            link: item.link,
                            active: item.active,
                          })}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAd(item.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: CREATE/EDIT FEATURED */}
      {featuredModal.isOpen && (
        <div className="fixed inset-0 bg-[#112954]/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full p-6 sm:p-8 my-auto">
            <h3 className="text-xl font-extrabold text-[#112954] mb-6">
              {featuredModal.mode === 'create' ? 'Create Announcement' : 'Edit Featured Item'}
            </h3>
            
            <form onSubmit={handleSaveFeatured} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Title*</label>
                <input
                  type="text"
                  required
                  value={featuredModal.title}
                  onChange={e => setFeaturedModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Scholarship Registration Open!"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description*</label>
                <textarea
                  required
                  rows={3}
                  value={featuredModal.description}
                  onChange={e => setFeaturedModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed announcement or summary body text..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Badge Copy</label>
                  <input
                    type="text"
                    value={featuredModal.badge}
                    onChange={e => setFeaturedModal(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. UPDATE, NEW"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Link Text</label>
                  <input
                    type="text"
                    value={featuredModal.linkText}
                    onChange={e => setFeaturedModal(prev => ({ ...prev, linkText: e.target.value }))}
                    placeholder="e.g. Apply Now"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Target URL</label>
                <input
                  type="text"
                  value={featuredModal.link}
                  onChange={e => setFeaturedModal(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="e.g. /explore-careers or https://example.com"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="feat-active"
                  checked={featuredModal.active}
                  onChange={e => setFeaturedModal(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="feat-active" className="text-sm font-semibold text-gray-600 select-none">Set Active (Visible on Home Page)</label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setFeaturedModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 font-bold rounded-full text-sm text-gray-500 text-center transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm text-center transition shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE/EDIT AD */}
      {adModal.isOpen && (
        <div className="fixed inset-0 bg-[#112954]/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg w-full p-6 sm:p-8 my-auto">
            <h3 className="text-xl font-extrabold text-[#112954] mb-6">
              {adModal.mode === 'create' ? 'Post Sponsored Ad' : 'Edit Ad Placement'}
            </h3>
            
            <form onSubmit={handleSaveAd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Sponsor Name*</label>
                <input
                  type="text"
                  required
                  value={adModal.title}
                  onChange={e => setAdModal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Grameenphone Career Accelerator"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description*</label>
                <textarea
                  required
                  rows={2}
                  value={adModal.description}
                  onChange={e => setAdModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief promo text..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Sponsor Image Logo URL</label>
                <input
                  type="text"
                  value={adModal.imageUrl}
                  onChange={e => setAdModal(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="e.g. https://domain.com/logo.png"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Redirect URL</label>
                <input
                  type="text"
                  value={adModal.link}
                  onChange={e => setAdModal(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="e.g. https://sponsor.com/opportunity"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ad-active"
                  checked={adModal.active}
                  onChange={e => setAdModal(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="ad-active" className="text-sm font-semibold text-gray-600 select-none">Set Active (Visible to users)</label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setAdModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 font-bold rounded-full text-sm text-gray-500 text-center transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm text-center transition shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {deleteUserModal.isOpen && (
        <div className="fixed inset-0 bg-[#112954]/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-sm w-full p-6 text-center my-auto">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-extrabold text-[#112954] mt-4 mb-2">Delete User Account</h3>
            <p className="text-gray-500 text-xs sm:text-sm px-2">
              Are you sure you want to permanently delete the account of <strong>{deleteUserModal.userName}</strong>? This action is irreversible.
            </p>
            <div className="flex gap-3 pt-6 mt-2">
              <button
                type="button"
                onClick={() => setDeleteUserModal({ isOpen: false, userId: null, userName: '' })}
                className="flex-1 py-2.5 px-4 border border-gray-200 hover:bg-gray-50 font-bold rounded-full text-xs text-gray-500 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs transition shadow-md cursor-pointer"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
