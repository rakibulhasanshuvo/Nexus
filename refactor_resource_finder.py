import re

with open("src/components/ResourceFinder.tsx", "r") as f:
    content = f.read()

# 1. Update state variables
content = re.sub(
    r'const \[expandedModule, setExpandedModule\] = useState<string \| null>\(null\);',
    r'const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);',
    content
)

content = re.sub(
    r'const \[activeTabs, setActiveTabs\] = useState<Record<string, \'cheat\' \| \'tma\' \| \'tutorial\'>>\(\{\}\);\n\n  const handleTabChange = \(moduleId: string, tab: \'cheat\' \| \'tma\' \| \'tutorial\'\) => \{\n    setActiveTabs\(prev => \(\{ \.\.\.prev, \[moduleId\]: tab \}\)\);\n  \};\n',
    r'',
    content
)

# Replace instances of setExpandedModule in handleSemesterChange and handleCourseChange
content = re.sub(
    r'setExpandedModule\(null\);',
    r'setSelectedModuleId(null);',
    content
)

# 2. Extract tools logic and layout into a Command Center
# We need to construct the Command Center UI and place it after the Control Strip
# Find the end of Control Strip
control_strip_end = content.find("      {/* Dynamic Content Area */}")

# Command Center UI string
command_center_ui = """
      {/* Subject Command Center */}
      {selectedCourse && courseDetail && (
        <div className="space-y-6 mb-8">
          <div className="apple-card bg-[var(--bg-secondary)] border-[var(--border-subtle)] p-6 shadow-sm">
            <h3 className="text-[16px] font-black uppercase tracking-widest text-[var(--text-primary)] mb-4">Subject Command Center</h3>
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Target Unit</label>
              <select
                value={selectedModuleId || ''}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="apple-select w-full h-12 font-bold text-[13px] hover:bg-[var(--bg-tertiary)] bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
              >
                <option value="" disabled>Select a unit to process...</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>Unit {m.unit}: {m.title}</option>
                ))}
              </select>
            </div>

            {selectedModuleId && (() => {
              const module = modules.find(m => m.id === selectedModuleId)!;
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 1-Page Cheat Sheet */}
                  <div className="apple-card bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border-subtle)] flex flex-col gap-6 group/cheat relative">
                    {cheatSheets[module.id] && <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 blur-3xl rounded-full pointer-events-none" />}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[var(--accent)]" />
                        <h4 className="font-black text-[11px] text-[var(--text-primary)] uppercase tracking-[0.2em]">1-Page Cheat Sheet</h4>
                      </div>
                      {cheatSheets[module.id] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); clearModuleCache('cheat', module.id); }}
                            className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors group/refresh"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover/refresh:text-[var(--accent)]" />
                          </button>
                          <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] leading-relaxed z-10 flex-1">
                      Distill this BOU unit into a high-octane summary. Extracts core concepts, formulas, code snippets, and top exam tips.
                    </p>

                    {loadingActionId === `cheat-${module.id}` ? (
                      <SkeletonLoader />
                    ) : cheatSheets[module.id] ? (
                      <div className="mt-2 text-[14px] font-medium p-6 bg-[var(--accent-subtle)] rounded-xl border border-[var(--accent)]/10 z-10 max-h-[600px] overflow-y-auto style-markdown text-[var(--text-primary)]">
                        <ReactMarkdown>{cheatSheets[module.id]}</ReactMarkdown>
                      </div>
                    ) : (
                      <button
                        aria-label="Generate 1-Page Summary"
                        onClick={(e) => handleGenerateCheatSheet(e, module.id, module.title, module.topics)}
                        disabled={loadingActionId !== null}
                        className="mt-auto h-12 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 z-10"
                      >
                        <Flame className="w-4 h-4" />
                        Generate Exam Summary
                      </button>
                    )}
                  </div>

                  {/* TMA Expert */}
                  <div className="apple-card bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border-subtle)] flex flex-col gap-6 group/tma relative">
                    {tmaOutlines[module.id] && <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 blur-3xl rounded-full pointer-events-none" />}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-[var(--accent)]" />
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">TMA Expert</h4>
                      </div>
                      {tmaOutlines[module.id] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); clearModuleCache('tma', module.id); }}
                            className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors group/refresh"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover/refresh:text-[var(--accent)]" />
                          </button>
                          <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] leading-relaxed z-10">
                      Paste a specific assignment question below. The AI will generate a strict structural outline ensuring you hit BOU marking criteria.
                    </p>

                    <input
                      type="text"
                      placeholder="e.g., 'Describe the differences...'"
                      value={userContexts[module.id] || ''}
                      onChange={(e) => handleContextChange(module.id, e.target.value)}
                      className="h-10 px-4 rounded-xl text-[12px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-subtle)] transition-all z-10"
                    />

                    {loadingActionId === `tma-${module.id}` ? (
                      <SkeletonLoader />
                    ) : tmaOutlines[module.id] ? (
                      <div className="mt-2 text-[14px] font-medium p-6 bg-[var(--accent-subtle)] rounded-xl border border-[var(--accent)]/20 z-10 max-h-[600px] overflow-y-auto style-markdown text-[var(--text-primary)] flex-1">
                         <ReactMarkdown>{tmaOutlines[module.id]}</ReactMarkdown>
                      </div>
                    ) : (
                      <button
                        aria-label="Generate TMA Strategy"
                        disabled={loadingActionId !== null}
                        onClick={(e) => handleGenerateTMAOutline(e, module.id, module.title)}
                        className="mt-auto h-12 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] z-10"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Architect TMA Answer
                      </button>
                    )}
                  </div>

                  {/* Curated Resources */}
                  <div className="apple-card bg-[var(--bg-secondary)] p-6 shadow-sm border border-[var(--border-subtle)] flex flex-col gap-6 group/tutorial relative">
                    {tutorials[module.id] && <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--danger)]/5 blur-3xl rounded-full pointer-events-none" />}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-[var(--danger)]" />
                        <h4 className="font-black text-[11px] text-[var(--text-primary)] uppercase tracking-[0.2em]">Curated Resources</h4>
                      </div>
                      {tutorials[module.id] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); clearModuleCache('tutorial', module.id); }}
                            className="p-1 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors group/refresh"
                            title="Clear & Refresh"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover/refresh:text-[var(--danger)]" />
                          </button>
                          <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[var(--text-tertiary)] leading-relaxed z-10">
                      Discover the highest-rated videos and articles customized for this complex unit.
                    </p>

                    <select
                      value={tutorialPref[module.id] || "Best Bangla Tutorials from any platform"}
                      onChange={(e) => setTutorialPref(prev => ({ ...prev, [module.id]: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 px-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--danger)]/30 focus:ring-2 focus:ring-[var(--danger)]/10 z-10 appearance-none cursor-pointer"
                    >
                      <option value="Best Bangla Tutorials from any platform">🇧🇩 Bangla Tutorials (Any Platform)</option>
                      <option value="Best English Tutorials with animations from any platform">🇬🇧 English Tutorials (Any Platform)</option>
                      <option value="High quality written articles (GeeksforGeeks, etc)">📝 Written Articles</option>
                      <option value="University courses (MIT OCW, NPTEL, Coursera)">🎓 University Courses</option>
                    </select>

                    {loadingActionId === `tutorial-${module.id}` ? (
                      <SkeletonLoader />
                    ) : tutorials[module.id] ? (
                      <div className="mt-2 flex flex-col gap-4 z-10 max-h-[600px] overflow-y-auto pr-2 pb-1 flex-1">
                        {tutorials[module.id].map((tut, i) => (
                          <a
                            key={i}
                            href={tut.url || (tut.type === 'video'
                              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(tut.searchQuery)}`
                              : `https://www.google.com/search?q=${encodeURIComponent(tut.searchQuery)}`)
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="block p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--danger)]/30 hover:shadow-lg bg-[var(--bg-secondary)] transition-all group/card"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {tut.type === 'video' ? <Video className="w-4 h-4 text-[var(--danger)]" /> : <FileText className="w-4 h-4 text-[var(--accent)]" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                    {tut.provider}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                                    {tut.language}
                                  </span>
                                </div>
                                <h5 className="text-[13px] font-black leading-tight mb-1 text-[var(--text-primary)] group-hover/card:text-[var(--danger)] transition-colors">
                                  {tut.title}
                                </h5>
                                <p className="text-[10px] font-bold text-[var(--text-tertiary)] leading-snug line-clamp-2">
                                  {tut.reason}
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                        <button
                          aria-label="Find Video Lectures"
                          onClick={(e) => handleGenerateTutorials(e, module.id, module.title, module.topics, true)}
                          disabled={loadingActionId !== null}
                          className="mt-2 h-10 w-full rounded-xl border-2 border-dashed border-[var(--border-subtle)] text-[var(--text-tertiary)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Search className="w-3 h-3" />
                          Find More
                        </button>
                      </div>
                    ) : (
                      <button
                        aria-label="Find Video Content"
                        onClick={(e) => handleGenerateTutorials(e, module.id, module.title, module.topics)}
                        disabled={loadingActionId !== null}
                        className="mt-auto h-12 rounded-xl bg-[var(--danger)] text-[var(--bg-primary)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-colors disabled:opacity-50 z-10 shrink-0"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Find Best Resources
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
"""
content = content[:control_strip_end] + command_center_ui + content[control_strip_end:]


# 3. Simplify unit mapping list
# Replace the <AnimatePresence> that contains the module cards with a simpler one

# Find where the mapping starts
modules_map_start = content.find("{modules.map((module) => (")
# Find the ending of that section
# Since we know the previous structure, we'll replace everything from modules.map to the end of that block.
# Look for the last motion.div inside the map
old_modules_block_end = content.find("              </motion.div>\n            ))}\n          </AnimatePresence>")

if modules_map_start != -1 and old_modules_block_end != -1:
    old_modules_block_end += len("              </motion.div>\n            ))}\n          </AnimatePresence>")

    new_modules_block = """{modules.map((module) => (
              <motion.div
                layout
                key={module.id}
                className={`apple-card overflow-hidden transition-all duration-300 ${selectedModuleId === module.id ? 'border-[var(--accent)]/50 shadow-[var(--card-shadow-elevated)] scale-[1.01] z-20 relative bg-[var(--bg-secondary)]' : 'border-[var(--border-subtle)]/50 hover:border-[var(--border-subtle)] bg-[var(--bg-secondary)]'}`}
              >
                <div
                  className="p-5 cursor-pointer flex items-center justify-between bg-[var(--bg-secondary)] group"
                  onClick={() => setSelectedModuleId(selectedModuleId === module.id ? null : module.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[14px] shadow-sm ${module.isHighYield ? 'bg-[var(--danger)]/5 text-[var(--danger)] border border-[var(--danger)]/10' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'}`}>
                      U{module.unit}
                    </div>
                    <div>
                      <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase">{module.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {module.isHighYield && (
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[var(--danger)] bg-[var(--danger)]/5 border border-[var(--danger)]/10 px-2 py-0.5 rounded-md">
                            <Flame className="w-3 h-3 fill-current" /> High-Yield PYQ Trend
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                          Relevance Score: {module.priorityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${selectedModuleId === module.id ? 'bg-[var(--accent)] text-[var(--bg-primary)] border-transparent' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModuleId(module.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {selectedModuleId === module.id ? 'Targeting' : 'Target Unit'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>"""

    content = content[:modules_map_start] + new_modules_block + content[old_modules_block_end:]


with open("src/components/ResourceFinder.tsx", "w") as f:
    f.write(content)
