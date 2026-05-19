import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PSYCHOLOGICAL_TESTS, TEST_CATEGORIES } from '../data/tests';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function AssignTests() {
  const { activeClient, assignTests, navigate } = useApp();
  const [selected, setSelected] = useState<string[]>(activeClient?.assignedTests ?? []);
  const [filterCat, setFilterCat] = useState('Бүгд');

  useEffect(() => {
    if (!activeClient) navigate('psych-dashboard');
  }, [activeClient]);

  if (!activeClient) return null;

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    assignTests(activeClient!.id, selected);
    navigate('psych-client-detail', { selectedClientId: activeClient!.id });
  }

  const categories = ['Бүгд', ...TEST_CATEGORIES];
  const filtered = PSYCHOLOGICAL_TESTS.filter((t) => filterCat === 'Бүгд' || t.category === filterCat);

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div className="bg-white border-b border-stone-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('psych-client-detail', { selectedClientId: activeClient.id })}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: MUTED }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>
          <div className="text-center">
            <h1 className="font-bold text-sm" style={{ color: TEXT }}>Тест хуваарилах</h1>
            <p className="text-xs" style={{ color: MUTED }}>{activeClient.name}</p>
          </div>
          <button
            onClick={save}
            className="text-white px-5 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: G }}
          >
            Хадгалах ({selected.length})
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border"
              style={filterCat === cat
                ? { backgroundColor: G, color: 'white', borderColor: G }
                : { backgroundColor: 'white', color: MUTED, borderColor: '#e7e5e4' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 mb-4 text-sm">
          <button onClick={() => setSelected(PSYCHOLOGICAL_TESTS.map((t) => t.id))}
            className="font-medium hover:underline" style={{ color: G }}>
            Бүгдийг сонгох
          </button>
          <span className="text-stone-200">|</span>
          <button onClick={() => setSelected([])} className="hover:underline" style={{ color: MUTED }}>
            Цуцлах
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((test) => {
            const isSelected = selected.includes(test.id);
            return (
              <button
                key={test.id}
                onClick={() => toggle(test.id)}
                className="p-4 rounded-2xl border-2 text-left transition-all"
                style={isSelected
                  ? { borderColor: G, backgroundColor: '#F0F5F1' }
                  : { borderColor: '#e7e5e4', backgroundColor: 'white' }
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all border-2"
                    style={isSelected
                      ? { backgroundColor: G, borderColor: G }
                      : { backgroundColor: 'transparent', borderColor: '#d6d3d1' }
                    }
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={isSelected
                          ? { backgroundColor: '#D1E4D8', color: '#2D5A37' }
                          : { backgroundColor: '#f5f5f4', color: MUTED }
                        }
                      >
                        {test.shortName}
                      </span>
                      <span className="text-xs" style={{ color: MUTED }}>{test.timeMinutes} мин</span>
                    </div>
                    <p className="font-semibold text-sm leading-tight" style={{ color: TEXT }}>{test.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{test.category}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
