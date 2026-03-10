import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, FolderPlus, Trash2, GripVertical, PlusSquare, Pencil } from 'lucide-react';
import { ReactSortable } from 'react-sortablejs';

interface LinkItem {
  id: string;
  name: string;
  url: string;
}

interface Section {
  id: string;
  title: string;
  links: LinkItem[];
}

const defaultSections: Section[] = [
  {
    id: 's1',
    title: 'Generale',
    links: [
      { id: '1', name: 'GitHub', url: 'https://github.com' },
      { id: '2', name: 'YouTube', url: 'https://youtube.com' },
      { id: '3', name: 'Gmail', url: 'https://mail.google.com' },
      { id: '4', name: 'ChatGPT', url: 'https://chat.openai.com' },
      { id: '5', name: 'Figma', url: 'https://figma.com' },
    ]
  }
];

const QuickLinks = ({ isEditMode }: { isEditMode: boolean }) => {
  const [sections, setSections] = useState<Section[]>(() => {
    const savedSections = localStorage.getItem('quicklinks_sections');
    if (savedSections) {
      try {
        return JSON.parse(savedSections);
      } catch {
        return defaultSections;
      }
    }

    const savedFlatLinks = localStorage.getItem('quicklinks');
    if (savedFlatLinks) {
      try {
        const parsed = JSON.parse(savedFlatLinks);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].title) {
          return [{ id: 's1', title: 'Generale', links: parsed }];
        }
      } catch {
        // Fallback
      }
    }

    return defaultSections;
  });

  const [addingToSection, setAddingToSection] = useState<string | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editTitleVal, setEditTitleVal] = useState('');

  useEffect(() => {
    localStorage.setItem('quicklinks_sections', JSON.stringify(sections));
  }, [sections]);

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    const newSection: Section = {
      id: Date.now().toString(),
      title: sectionTitle.trim(),
      links: []
    };

    setSections([...sections, newSection]);
    setIsAddingSection(false);
    setSectionTitle('');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa sezione e tutti i suoi link?")) {
      setSections(sections.filter(s => s.id !== sectionId));
    }
  };

  const handleSaveEdit = (sectionId: string) => {
    if (editTitleVal.trim()) {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title: editTitleVal.trim() } : s));
    }
    setEditingSection(null);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkUrl.trim() || !addingToSection) return;

    let finalUrl = linkUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const newLink: LinkItem = {
      id: Date.now().toString(),
      name: linkName.trim(),
      url: finalUrl,
    };

    setSections(sections.map(s => {
      if (s.id === addingToSection) {
        return { ...s, links: [...s.links, newLink] };
      }
      return s;
    }));

    setAddingToSection(null);
    setLinkName('');
    setLinkUrl('');
  };

  const handleDeleteLink = (e: React.MouseEvent, sectionId: string, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, links: s.links.filter(l => l.id !== linkId) };
      }
      return s;
    }));
  };

  return (
    <div className="w-full max-w-4xl mt-8 pb-12">
      <ReactSortable
        list={sections}
        setList={setSections}
        group="sections"
        animation={200}
        handle=".section-drag-handle"
        disabled={!isEditMode}
        className="space-y-6"
      >
        {sections.map(section => (
          <div 
            key={section.id} 
            className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-5 shadow-lg backdrop-blur-md transition-colors hover:bg-slate-800/40"
          >
            {/* Section Header */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 ${isEditMode ? 'border-b border-slate-700/50' : ''}`}>
              <div className="flex items-center gap-3">
                {isEditMode && (
                  <div 
                    className="section-drag-handle cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Trascina Sezione"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                )}
                {editingSection === section.id ? (
                  <input
                    type="text"
                    value={editTitleVal}
                    onChange={(e) => setEditTitleVal(e.target.value)}
                    onBlur={() => handleSaveEdit(section.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(section.id);
                      if (e.key === 'Escape') setEditingSection(null);
                    }}
                    autoFocus
                    className="bg-slate-900/50 border border-emerald-500/50 text-white px-2 py-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-xl font-medium w-full max-w-[200px]"
                  />
                ) : (
                  <h2 className="text-xl font-medium text-slate-200">{section.title}</h2>
                )}
              </div>
              
              {isEditMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSection(section.id);
                      setEditTitleVal(section.title);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Rinomina Sezione"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <motion.button 
                    onClick={() => setAddingToSection(section.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors text-sm font-medium"
                  >
                    <PlusSquare className="w-4 h-4" />
                    Link
                  </motion.button>
                  <button 
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Elimina Sezione"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Links Grid */}
            <ReactSortable
              list={section.links}
              setList={(newLinks) => {
                setSections(prev => prev.map(s => s.id === section.id ? { ...s, links: newLinks } : s));
              }}
              group="links"
              animation={200}
              disabled={!isEditMode}
              ghostClass="opacity-30"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 min-h-[5rem]"
            >
              {section.links.map((link) => (
                <div
                  key={link.id}
                  className={`relative group rounded-2xl h-full ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                  {/* The actual Link card */}
                  <div className="flex flex-col items-center justify-center p-4 h-full rounded-2xl bg-slate-800/60 border border-slate-700/50 shadow-sm transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500/50 hover:-translate-y-1">
                    {/* Delete Button */}
                    {isEditMode && (
                      <button
                        onClick={(e) => handleDeleteLink(e, section.id, link.id)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all scale-75 group-hover:scale-100 z-10 shadow-lg"
                        title="Elimina"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}

                    {/* Open Link (clicking the card content, but avoiding drag issues) */}
                    <a 
                      href={link.url}
                      className="flex flex-col items-center justify-center w-full h-full"
                      draggable={false} // Prevent default browser link dragging
                    >
                      <div className="w-10 h-10 mb-3 rounded-xl flex items-center justify-center bg-slate-900/50 group-hover:bg-slate-900 overflow-hidden transition-colors shadow-inner">
                        <img 
                          src={`https://www.google.com/s2/favicons?sz=64&domain_url=${link.url}`} 
                          alt={link.name}
                          className="w-6 h-6 object-contain"
                          draggable={false}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <LinkIcon className="w-5 h-5 text-slate-400 hidden absolute" />
                      </div>
                      <span className="text-sm font-medium truncate w-full text-center px-1 text-slate-300 group-hover:text-white">{link.name}</span>
                    </a>
                  </div>
                </div>
              ))}
            </ReactSortable>
            
            {section.links.length === 0 && isEditMode && (
               <div className="flex items-center justify-center w-full py-6 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-2xl mt-4">
                 Trascina qui i tuoi link o aggiungine di nuovi
               </div>
            )}
            
          </div>
        ))}
      </ReactSortable>

      {/* Add Section Button (Global) */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex justify-center mt-8 overflow-hidden"
          >
            <motion.button
              onClick={() => setIsAddingSection(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 backdrop-blur-md transition-all shadow-sm"
            >
              <FolderPlus className="w-5 h-5" />
              <span className="font-medium">Nuova Sezione</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}

      {/* Add Link Modal */}
      <AnimatePresence>
        {addingToSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium text-lg">Nuovo Link</h3>
                <button onClick={() => { setAddingToSection(null); setLinkName(''); setLinkUrl(''); }} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddLink} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="Nome (es. Netflix)"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-base focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  autoFocus
                  required
                />
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL (es. netflix.com)"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-base focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  Salva Collegamento
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Section Modal */}
      <AnimatePresence>
        {isAddingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium text-lg">Nuova Sezione</h3>
                <button onClick={() => { setIsAddingSection(false); setSectionTitle(''); }} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSection} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Titolo sezione (es. Lavoro, Svago...)"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-base focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
                >
                  Crea Sezione
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickLinks;
