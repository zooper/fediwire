import { useStore } from '../../store/useStore';
import type { FilterType } from '../../store/useStore';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'media', label: 'MEDIA' },
  { id: 'links', label: 'LINKS' },
  { id: 'threads', label: 'THREADS' },
];

export default function Filters() {
  const { activeFilter, setActiveFilter } = useStore();

  return (
    <div className="text-[12px] p-2">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            style={activeFilter === filter.id ? { backgroundColor: '#3182ce', color: '#ffffff', borderColor: '#3182ce' } : {}}
            className={`px-3 py-1 rounded border text-[11px] font-medium transition-colors ${
              activeFilter === filter.id
                ? ''
                : 'border-mirc-border bg-white text-mirc-text hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
