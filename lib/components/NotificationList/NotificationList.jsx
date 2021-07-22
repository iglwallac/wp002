import React from 'react'

// HOC to render list of custom notifications
export default function (props) {
  const {
    notificationComponent,
    notifications,
    className,
    options,
    onClick,
  } = props
  const NotificationComponent = notificationComponent
  return (
    notifications.map((notification) => {
      const isRead = notification.is_read
      const unread = isRead ? '' : 'unread'

      return (
        <li key={notification.id} className={`${className} ${className}--${unread}`}>
          <NotificationComponent
            onClick={onClick}
            notification={notification}
            options={options}
          />
        </li>
      )
    })
  )
}
