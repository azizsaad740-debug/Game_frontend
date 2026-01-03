'use client'

import { useState, useEffect, useRef } from 'react'
import { notificationAPI } from '@/lib/api'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { log } from '@/utils/logger'

export default function NotificationDropdown({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      fetchUnreadCount()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount()
        if (isOpen) {
          fetchNotifications()
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [userId, isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationAPI.getNotifications({ limit: 10 })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (err) {
      log.apiError('/notifications', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      setUnreadCount(response.data.unreadCount || 0)
    } catch (err) {
      // Silently fail for unread count
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      log.apiError('/notifications/mark-read', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      )
      setUnreadCount(0)
    } catch (err) {
      log.apiError('/notifications/mark-all-read', err)
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      // Update unread count if deleted notification was unread
      const deleted = notifications.find(n => n._id === notificationId)
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      log.apiError('/notifications/delete', err)
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id)
    }
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            fetchNotifications()
          }
        }}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-background-dark text-gray-300 hover:bg-surface transition-colors"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-[60] w-80 sm:w-96 rounded-lg bg-surface border border-surface shadow-xl animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-surface p-4">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary hover:text-yellow-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-surface">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-background-dark transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-background-dark/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 mt-1 ${!notification.isRead ? 'text-primary' : 'text-gray-400'}`}>
                        <span className="material-symbols-outlined">
                          {notification.type === 'deposit_approved' || notification.type === 'withdrawal_approved'
                            ? 'check_circle'
                            : notification.type === 'deposit_rejected' || notification.type === 'withdrawal_rejected'
                            ? 'cancel'
                            : notification.type === 'bet_won'
                            ? 'emoji_events'
                            : notification.type === 'bonus_awarded'
                            ? 'card_giftcard'
                            : notification.type === 'support_ticket_replied'
                            ? 'support_agent'
                            : 'notifications'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 size-2 rounded-full bg-primary"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification._id)
                        }}
                        className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-surface p-3 text-center">
              <a
                href="/notifications"
                className="text-sm text-primary hover:text-yellow-400 transition-colors"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

