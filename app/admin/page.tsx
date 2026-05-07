'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/app/contexts/UserContext'
import Link from 'next/link'
import LanguageToggle from '@/app/components/LanguageToggle'

interface Mentor {
  id: string
  email: string
  name: string
  expertise: string[]
  active: boolean
}

interface ActionModal {
  isOpen: boolean
  mentor: Mentor | null
  action: 'activate' | 'deactivate'
  adminPassword: string
  loading: boolean
  error: string
}

export default function AdminPage() {
  const { user, setUser } = useUser()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ActionModal>({
    isOpen: false,
    mentor: null,
    action: 'activate',
    adminPassword: '',
    loading: false,
    error: ''
  })

  // Check if user is admin
  useEffect(() => {
    if (user && user.type !== 'admin') {
      window.location.href = '/'
    }
  }, [user])

  // Fetch mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch('/api/auth?mentors=true')
        if (!res.ok) throw new Error('Failed to fetch mentors')
        const data = await res.json()
        setMentors(data.mentors)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.type === 'admin') {
      fetchMentors()
    }
  }, [user])

  const openModal = (mentor: Mentor, action: 'activate' | 'deactivate') => {
    setModal({
      isOpen: true,
      mentor,
      action,
      adminPassword: '',
      loading: false,
      error: ''
    })
  }

  const closeModal = () => {
    setModal({
      isOpen: false,
      mentor: null,
      action: 'activate',
      adminPassword: '',
      loading: false,
      error: ''
    })
  }

  const handleConfirm = async () => {
    if (!modal.mentor || !user?.email || !modal.adminPassword) {
      setModal(prev => ({ ...prev, error: 'Missing required fields' }))
      return
    }

    setModal(prev => ({ ...prev, loading: true, error: '' }))

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: modal.action === 'activate' ? 'activate-mentor' : 'deactivate-mentor',
          type: 'admin',
          adminEmail: user.email,
          adminPassword: modal.adminPassword,
          mentorEmail: modal.mentor.email
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed to ${modal.action} mentor`)
      }

      // Update local state
      setMentors(prev =>
        prev.map(m =>
          m.email === modal.mentor?.email
            ? { ...m, active: modal.action === 'activate' }
            : m
        )
      )

      closeModal()
    } catch (err) {
      setModal(prev => ({ ...prev, error: (err as Error).message }))
    } finally {
      setModal(prev => ({ ...prev, loading: false }))
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
      // Always clear client session, even if logout API fails.
    } finally {
      setUser(null)
      window.location.href = '/'
    }
  }

  if (!user || user.type !== 'admin') {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage mentor activations</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle variant="light" />
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Mentors List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Mentors ({mentors.length})
            </h2>
          </div>

          {loading ? (
            <div className="px-4 sm:px-6 py-12 text-center text-gray-500">
              Loading mentors...
            </div>
          ) : mentors.length === 0 ? (
            <div className="px-4 sm:px-6 py-12 text-center text-gray-500">
              No mentors found
            </div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expertise</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentors.map(mentor => (
                      <tr key={mentor.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{mentor.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mentor.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {mentor.expertise.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {mentor.expertise.slice(0, 2).map(exp => (
                                <span key={exp} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {exp}
                                </span>
                              ))}
                              {mentor.expertise.length > 2 && (
                                <span className="text-gray-500 text-xs">
                                  +{mentor.expertise.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              mentor.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {mentor.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              openModal(mentor, mentor.active ? 'deactivate' : 'activate')
                            }
                            className={`px-4 py-2 rounded-lg font-bold text-white transition text-sm ${
                              mentor.active
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {mentor.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{mentor.name}</p>
                      <p className="text-sm text-gray-600 break-all">{mentor.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Expertise</p>
                      {mentor.expertise.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.slice(0, 3).map(exp => (
                            <span key={exp} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {exp}
                            </span>
                          ))}
                          {mentor.expertise.length > 3 && (
                            <span className="text-gray-500 text-xs">+{mentor.expertise.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          mentor.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {mentor.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => openModal(mentor, mentor.active ? 'deactivate' : 'activate')}
                        className={`flex-1 max-w-[140px] py-2 rounded-lg font-bold text-white text-sm transition ${
                          mentor.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {mentor.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {modal.isOpen && modal.mentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 my-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {modal.action === 'activate' ? 'Activate Mentor' : 'Deactivate Mentor'}
            </h3>

            <p className="text-gray-600 mb-6">
              {modal.action === 'activate'
                ? `Are you sure you want to activate ${modal.mentor.name}?`
                : `Are you sure you want to deactivate ${modal.mentor.name}?`}
            </p>

            {modal.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {modal.error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Your Admin Password
              </label>
              <input
                type="password"
                value={modal.adminPassword}
                onChange={e =>
                  setModal(prev => ({ ...prev, adminPassword: e.target.value }))
                }
                placeholder="Enter your admin password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={modal.loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={modal.loading || !modal.adminPassword}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-bold transition ${
                  modal.action === 'activate'
                    ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                    : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                }`}
              >
                {modal.loading ? 'Processing...' : modal.action === 'activate' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
