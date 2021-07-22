import Bundle from 'components/Bundle'

export default Bundle({
  loader: async () => {
    const { default: Component } = await import('./Component.jsx')
    return Component
  },
  loading: () => null,
})
