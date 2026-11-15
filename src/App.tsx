import { useMemo, useState } from "react";
import {
  Activity, Bell, BookOpen, CheckSquare, ChevronDown, Clock3, Command,
  FileText, Folder, Grid2X2, Layers3, List, LogOut, Menu, MoreHorizontal,
  Plus, Search, Settings, Star, X, PanelLeftClose, ArrowUpRight, type LucideIcon,
} from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string;
  updated: string;
  folders: number;
  notes: number;
  tasks: number;
  stories: number;
  visual: "mountain" | "colosseum" | "silk";
  favorite?: boolean;
};

const initialProjects: Project[] = [
  { id: 1, name: "ARD Core", description: "The core workspace for ARD systems, engine, and platform development.", updated: "2 hours ago", folders: 12, notes: 48, tasks: 26, stories: 8, visual: "mountain", favorite: true },
  { id: 2, name: "Rome Initiative", description: "A long-term build for the next generation of ARD Workspace.", updated: "5 hours ago", folders: 18, notes: 64, tasks: 37, stories: 14, visual: "colosseum" },
  { id: 3, name: "Creative Studio", description: "Design, media, and creative production for ARD projects.", updated: "Yesterday", folders: 9, notes: 27, tasks: 15, stories: 11, visual: "silk" },
];

const navItems: { label: string; icon: LucideIcon }[] = [
  { label: "Project Hub", icon: Layers3 },
  { label: "My Tasks", icon: CheckSquare },
  { label: "Notes", icon: FileText },
  { label: "Stories", icon: BookOpen },
  { label: "Files & Assets", icon: Folder },
  { label: "Activity", icon: Activity },
];

function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [activeNav, setActiveNav] = useState("Project Hub");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notice, setNotice] = useState("");

  const visibleProjects = useMemo(() => {
    const filtered = projects.filter((project) =>
      (project.name + " " + project.description).toLowerCase().includes(query.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.id - b.id;
      return b.id - a.id;
    });
  }, [projects, query, sort]);

  const createProject = () => {
    if (!projectName.trim()) return;
    setProjects((current) => [{
      id: Date.now(),
      name: projectName.trim(),
      description: projectDescription.trim() || "A new project workspace.",
      updated: "Just now", folders: 0, notes: 0, tasks: 0, stories: 0,
      visual: "silk",
    }, ...current]);
    setProjectName("");
    setProjectDescription("");
    setDialogOpen(false);
    setNotice("Project created in this preview session.");
  };

  const toggleFavorite = (id: number) => setProjects((current) =>
    current.map((project) => project.id === id ? { ...project, favorite: !project.favorite } : project),
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "" : "sidebar--collapsed"}`}>
        <div className="brand-block">
          <div className="brand-mark">A</div>
          {sidebarOpen && <div><strong>ARD Workspace</strong><span>Aura Engine</span></div>}
          <button className="icon-button sidebar-collapse" aria-label="Toggle sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}><PanelLeftClose size={17} /></button>
        </div>
        <div className="nav-caption">{sidebarOpen ? "WORKSPACE" : ""}</div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "active" : ""}`} onClick={() => { setActiveNav(label); if (label !== "Project Hub") setNotice(`${label} view is part of the next implementation stage.`); else setNotice(""); }}>
              <Icon size={19} /><span>{sidebarOpen ? label : ""}</span>
              {label === "My Tasks" && sidebarOpen && <small>6</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <div className="project-list-heading">{sidebarOpen && <span>PROJECTS</span>}<button className="icon-button" aria-label="Create project" onClick={() => setDialogOpen(true)}><Plus size={18}/></button></div>
        {sidebarOpen && <div className="sidebar-projects">
          {projects.slice(0, 5).map((project) => <button key={project.id} onClick={() => setNotice(`Selected ${project.name}. Project workspace navigation is next in the build sequence.`)}><span className={`project-dot ${project.visual}`}></span><span>{project.name}</span>{project.favorite && <Star size={14} className="favorite-small" fill="currentColor"/>}</button>)}
        </div>}
        <div className="sidebar-bottom">
          <button className="profile-button"><span className="avatar">A</span>{sidebarOpen && <span><b>ARD Creator</b><small>Workspace owner</small></span>}<ChevronDown size={15}/></button>
          <button className="nav-item"><Settings size={18}/>{sidebarOpen && <span>Settings</span>}</button>
          <button className="nav-item"><LogOut size={18}/>{sidebarOpen && <span>Sign out</span>}</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><button className="icon-button" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20}/></button><b>ARD Workspace</b></div>
          <div className="topbar-spacer" />
          <button className="search-shortcut" onClick={() => document.getElementById("project-search")?.focus()}><Search size={17}/><span>Search</span><kbd><Command size={11}/> K</kbd></button>
          <button className="icon-button notification" aria-label="Notifications" onClick={() => setNotice("You are all caught up.")}><Bell size={19}/><i/></button>
          <button className="account-avatar" aria-label="Account menu">A<ChevronDown size={13}/></button>
        </header>

        <div className="content-wrap">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-line"/> YOUR CREATIVE COMMAND CENTER</div>
              <h1>Good afternoon, <em>ARD.</em></h1>
              <p>Plan, create, and build your projects in one workspace.</p>
            </div>
            <div className="hero-orb" aria-hidden="true"><span/></div>
          </section>

          <section className="quick-actions" aria-label="Quick actions">
            <QuickAction icon={Plus} title="New Project" subtitle="Create a new workspace" onClick={() => setDialogOpen(true)} primary/>
            <QuickAction icon={FileText} title="New Note" subtitle="Capture ideas" onClick={() => setNotice("Notes will be connected in the Workspace implementation stage.")}/>
            <QuickAction icon={CheckSquare} title="New Task" subtitle="Add to your workflow" onClick={() => setNotice("Tasks will be connected in the Workspace implementation stage.")}/>
            <QuickAction icon={BookOpen} title="New Story" subtitle="Develop and write" onClick={() => setNotice("Stories will be connected in the Story implementation stage.")}/>
          </section>

          <section className="projects-section">
            <div className="section-heading">
              <div className="section-title"><Layers3 size={23}/><div><h2>Your Projects</h2><p>Your workspaces, ideas, and creations.</p></div></div>
              <div className="section-controls">
                <div className="view-toggle"><button className={layout === "grid" ? "selected" : ""} aria-label="Grid view" onClick={() => setLayout("grid")}><Grid2X2 size={17}/></button><button className={layout === "list" ? "selected" : ""} aria-label="List view" onClick={() => setLayout("list")}><List size={18}/></button></div>
                <button className="primary-button" onClick={() => setDialogOpen(true)}><Plus size={17}/> New Project</button>
              </div>
            </div>
            <div className="project-filters">
              <label className="project-search"><Search size={18}/><input id="project-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." /></label>
              <label className="sort-select"><span>Sort:</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">Recently updated</option><option value="name">Name A–Z</option><option value="oldest">Oldest first</option></select><ChevronDown size={15}/></label>
            </div>
            <div className={`project-grid ${layout === "list" ? "project-grid--list" : ""}`}>
              {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onFavorite={() => toggleFavorite(project.id)} onOpen={() => setNotice(`${project.name} selected. Project workspace routes will be implemented after this shell is reviewed.`)}/>)}
              {visibleProjects.length === 0 && <div className="empty-state"><Search size={24}/><b>No projects found</b><span>Try another search term.</span></div>}
            </div>
          </section>

          <section className="activity-panel">
            <div className="activity-heading"><div><Activity size={21}/><div><h3>Recent Activity</h3><p>The latest updates across your projects.</p></div></div><button onClick={() => setNotice("Activity history is scheduled for a later stage.")}>View all <ArrowUpRight size={15}/></button></div>
            <div className="activity-items">
              <ActivityItem icon={FileText} title="Updated project: ARD Core" detail="Edited architecture.md" time="2 hours ago"/>
              <ActivityItem icon={CheckSquare} title="Completed task: Set up workspace" detail="In Rome Initiative" time="5 hours ago"/>
              <ActivityItem icon={BookOpen} title="Added story: Project Foundation" detail="In Creative Studio" time="Yesterday"/>
            </div>
          </section>
          {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
          <footer className="page-footer"><span>ARD WORKSPACE</span><span>Built for ideas that become real.</span><span>FOUNDATION PREVIEW · 0.1</span></footer>
        </div>
      </main>

      {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}>
        <div className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
          <div className="modal-heading"><div><span className="modal-kicker">PROJECT HUB</span><h2 id="create-title">Create a project</h2></div><button className="icon-button" onClick={() => setDialogOpen(false)} aria-label="Close"><X size={19}/></button></div>
          <label>Project name<input autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g. Next big idea"/></label>
          <label>Description <span className="optional">OPTIONAL</span><textarea value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} placeholder="What are you building?" rows={3}/></label>
          <div className="modal-actions"><button className="secondary-button" onClick={() => setDialogOpen(false)}>Cancel</button><button className="primary-button" disabled={!projectName.trim()} onClick={createProject}><Plus size={16}/> Create project</button></div>
          <p className="modal-footnote">Preview only — this project is held in local session state, not saved to a database.</p>
        </div>
      </div>}
    </div>
  );
}

function QuickAction({ icon: Icon, title, subtitle, onClick, primary = false }: { icon: LucideIcon; title: string; subtitle: string; onClick: () => void; primary?: boolean }) {
  return <button className="quick-action" onClick={onClick}><span className={`quick-icon ${primary ? "quick-icon--primary" : ""}`}><Icon size={20}/></span><span className="quick-copy"><b>{title}</b><small>{subtitle}</small></span><ArrowUpRight className="quick-arrow" size={15}/></button>;
}

function ProjectCard({ project, onFavorite, onOpen }: { project: Project; onFavorite: () => void; onOpen: () => void }) {
  return <article className={`project-card ${project.favorite ? "project-card--featured" : ""}`}>
    <button className={`project-art project-art--${project.visual}`} onClick={onOpen} aria-label={`Open ${project.name}`}>
      {project.visual === "mountain" && <div className="mountain-scene"><span className="moon"/><span className="peak peak-one"/><span className="peak peak-two"/><span className="ridge"/></div>}
      {project.visual === "colosseum" && <div className="colosseum-scene"><span className="sunset"/><span className="arena">◉ ◉ ◉</span></div>}
      {project.visual === "silk" && <div className="silk-scene"><span/><span/><span/></div>}
    </button>
    <button className={`favorite-button ${project.favorite ? "is-favorite" : ""}`} onClick={onFavorite} aria-label={project.favorite ? "Remove favorite" : "Add favorite"}><Star size={17} fill={project.favorite ? "currentColor" : "none"}/></button>
    <div className="project-card-body">
      <button className="project-name" onClick={onOpen}>{project.name}</button>
      <p>{project.description}</p>
      <div className="project-stats"><span><Folder size={15}/>{project.folders}</span><span><FileText size={15}/>{project.notes}</span><span><CheckSquare size={15}/>{project.tasks}</span><span><BookOpen size={15}/>{project.stories}</span></div>
      <div className="project-card-footer"><span><Clock3 size={14}/> Updated {project.updated}</span><button className="icon-button" aria-label={`More options for ${project.name}`} onClick={onOpen}><MoreHorizontal size={18}/></button></div>
    </div>
  </article>;
}

function ActivityItem({ icon: Icon, title, detail, time }: { icon: LucideIcon; title: string; detail: string; time: string }) {
  return <div className="activity-item"><span className="activity-icon"><Icon size={18}/></span><div><b>{title}</b><span>{detail}</span><small>{time}</small></div></div>;
}

export default App;