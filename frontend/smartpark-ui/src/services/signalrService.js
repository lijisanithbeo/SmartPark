import * as signalR from '@microsoft/signalr'

const HUB_URL = '/hubs/parking'

function getToken() {
  try {
    const stored = localStorage.getItem('smartpark_user')
    return stored ? JSON.parse(stored).token ?? null : null
  } catch {
    return null
  }
}

let connection = null

// Creates the HubConnection object synchronously — handlers can be registered on it
// immediately, even before connection.start() is called.
function ensureConnection() {
  if (connection) return
  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, { accessTokenFactory: getToken })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build()
}

const signalrService = {
  // Starts the connection if not already started/starting.
  start() {
    ensureConnection()
    if (connection.state !== signalR.HubConnectionState.Disconnected)
      return Promise.resolve()
    return connection.start().catch(() => {})
  },

  // Register handler immediately (synchronously) — call this BEFORE start().
  // SignalR JS allows registering on a Disconnected connection; handlers survive reconnects.
  on(event, handler) {
    ensureConnection()
    connection.on(event, handler)
  },

  off(event, handler) {
    connection?.off(event, handler)
  },

  async joinAdminGroup() {
    if (connection?.state === signalR.HubConnectionState.Connected)
      await connection.invoke('JoinAdminGroup')
  },

  async joinOwnerGroup(ownerId) {
    if (connection?.state === signalR.HubConnectionState.Connected)
      await connection.invoke('JoinOwnerGroup', ownerId)
  },

  async joinLocationGroup(locationId) {
    if (connection?.state === signalR.HubConnectionState.Connected)
      await connection.invoke('JoinLocationGroup', locationId)
  },

  async leaveLocationGroup(locationId) {
    if (connection?.state === signalR.HubConnectionState.Connected)
      await connection.invoke('LeaveLocationGroup', locationId)
  },
}

export default signalrService
