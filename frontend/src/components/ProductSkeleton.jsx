export default function ProductSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-3)' }}>
          <div className="skeleton aspect-[4/5]" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-8 w-full mt-3" />
          </div>
        </div>
      ))}
    </>
  )
}
