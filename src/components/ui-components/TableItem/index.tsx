import cn from "classnames"
import { TableItemProps } from "./interface"

export function TableItem({
  children,
  title,
  value,
  className,
}: TableItemProps) {
  const itemClassName = cn(
    className,
    "w-full flex px-3 items-center flex-row h-9 leading-8 odd:bg-tint-9 even:bg-tint-10 justify-between",
  )

  return (
    <div className={itemClassName}>
      {(title || value) && (
        <>
          <div className="inline text-black text-xs font-bold">{title}</div>
          <div className="inline text-black text-xs text-right">{value}</div>
        </>
      )}
      {children}
    </div>
  )
}

export default TableItem
