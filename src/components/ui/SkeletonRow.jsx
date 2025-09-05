export default function SkeletonRow() {
  return (
    <tr className="border-b border-gray-700">
      <td className="px-4 py-3"><div className="h-4 w-56 bg-gray-700 rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-9 w-40 bg-gray-700 rounded animate-pulse" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-72 bg-gray-700 rounded animate-pulse" /></td>
    </tr>
  );
}