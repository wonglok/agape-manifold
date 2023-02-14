export default function Instructions({ children }) {
  return (
    <div
      className='absolute max-w-lg px-10 py-8 text-sm rounded-lg shadow-xl bg-zinc-800 md:text-base top-16 left-1/2 transform -translate-x-1/2'
      style={{ maxWidth: 'calc(100% - 28px)' }}>
      <p className=''>{children}</p>
    </div>
  )
}
