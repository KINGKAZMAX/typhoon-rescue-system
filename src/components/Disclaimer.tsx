export default function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-warn-50 border border-warn-100 rounded-xl p-3 text-xs text-warn-700 leading-relaxed">
      {children}
    </div>
  )
}
