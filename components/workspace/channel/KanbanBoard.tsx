"use client";

import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, GripVertical, Loader2, AlignLeft, ChevronRight, ChevronLeft, Trash2, X, Save, User } from "lucide-react";
import { updateTaskStatus, createTask, deleteTask, updateTaskDetails } from "@/lib/actions/task.actions";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getInitials } from "@/lib/utils";

const COLUMNS = [
  { id: "TODO", title: "TODO", headerText: "text-slate-400", cardBg: "bg-slate-500/10 hover:bg-slate-500/20", cardBorder: "border-slate-500/30" },
  { id: "IN_PROGRESS", title: "IN-PROGRESS", headerText: "text-blue-400", cardBg: "bg-blue-500/20 hover:bg-blue-500/30", cardBorder: "border-blue-500/30" },
  { id: "IN_REVIEW", title: "IN-REVIEW", headerText: "text-amber-400", cardBg: "bg-amber-500/10 hover:bg-amber-500/20", cardBorder: "border-amber-500/30" },
  { id: "DONE", title: "DONE", headerText: "text-emerald-400", cardBg: "bg-emerald-500/10 hover:bg-emerald-500/20", cardBorder: "border-emerald-500/30" },
];
const AVATAR_COLORS = [
  "bg-blue-500/20 text-blue-500 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  "bg-purple-500/20 text-purple-500 border-purple-500/30",
  "bg-pink-500/20 text-pink-500 border-pink-500/30",
  "bg-orange-500/20 text-orange-500 border-orange-500/30",
  "bg-cyan-500/20 text-cyan-500 border-cyan-500/30",
];

export default function KanbanBoard({
  initialTasks = [],
  workspaceId,
  channelId,
  currentUserId,
  isCreator,
  members = []
}: any) {
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");


  // Agar creator hai toh sab dikhao, warna sirf wahi dikhao jisme assigneeId current user ho
  console.log("all tasks", tasks)
  const roleBasedTasks = isCreator
    ? tasks
    : tasks.filter(task => task.assigneeId._id === currentUserId);

  // Phir un visible tasks par Search aur Priority filter lagao
  const filteredTasks = roleBasedTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.ticketId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // --- DRAG AND DROP LOGIC ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    // 💡 CLIENT VALIDATION 1: Prevent Dragging
    const task = tasks.find(t => t._id === taskId);
    const assigneeId = task?.assigneeId?._id || task?.assigneeId; // Handle both populated and string IDs

    if (assigneeId !== currentUserId) {
      e.preventDefault(); // Drag action cancel kar dega
      toast.error("Only the assignee can move this task.");
      return;
    }

    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    await handleStatusChange(taskId, newStatus);
  };

  // ---- ACTIONS CALLING --------
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    // 💡 CLIENT VALIDATION 2: Mobile menu ya drop dono ke liye check
    const assigneeId = task.assigneeId?._id || task.assigneeId;
    if (assigneeId !== currentUserId) {
      toast.error("Only the assignee can move this task.");
      return;
    }

    // 1. BACKUP LELO
    const previousTasks = [...tasks];

    // 2. OPTIMISTIC UPDATE
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    setActiveMenuTaskId(null);

    // 3. API CALL
    try {
      const res = await updateTaskStatus(taskId, newStatus);
      if (!res.success) {
        toast.error(res.error || "Failed to move task"); // Server se aayi error dikhayega
        setTasks(previousTasks); // Rollback
      }
    } catch (error) {
      toast.error("Failed to move task");
      setTasks(previousTasks); // Rollback
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      const res = await createTask({
        workspaceId,
        channelId,
        title: newTaskTitle,
        description: newTaskDescription,
        status: "TODO"
      });
      if (res.success) {
        setTasks(prev => [res.task, ...prev]);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setIsAddingTask(false);
        toast.success("Task created");
      } else {
        toast.error(res.error || "Failed to create task");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
    setLoading(false);
  };

  const handleUpdateTaskDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSaving(true);

    // Naya updateTaskDetails API call jisme assigneeId bhi pass hoga
    const res = await updateTaskDetails(selectedTask._id, {
      title: selectedTask.title,
      description: selectedTask.description,
      priority: selectedTask.priority,
      assigneeId: selectedTask.assigneeId // 👈 Added Assingee
    });

    if (res.success) {
      setTasks(prev => prev.map(t => t._id === selectedTask._id ? res.task : t));
      toast.success("Task updated");
      setSelectedTask(null);
    } else {
      toast.error("Failed to update task");
    }
    setIsSaving(false);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    setTasks(prev => prev.filter(t => t._id !== selectedTask._id));
    setSelectedTask(null);

    const res = await deleteTask(selectedTask._id);
    if (res.success) toast.success("Task deleted");
    else toast.error("Failed to delete task");
  };

  return (
    <div className="flex-1 w-full h-full overflow-x-auto overflow-y-hidden custom-thin-scrollbar bg-background">

      {/* 1. SEARCH BAR */}
      <KanbanBoardSearchBar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
      />

      {/* 2. MAIN BOARD COLUMNS */}
      <div className="flex h-full min-w-full divide-x divide-border/50 border-t border-border/50">
        {COLUMNS.map((column, index) => (
          <div key={column.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)} className={`${activeColIndex === index ? "flex" : "hidden"} md:flex flex-col h-full w-full md:min-w-[280px] md:flex-1 shrink-0 bg-transparent`}>

            <ColumnHeader
              column={column}
              index={index}
              COLUMNS_LENGTH={COLUMNS.length}
              setActiveColIndex={setActiveColIndex}
              taskCount={filteredTasks.filter((t: any) => t.status === column.id).length}
            />

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto custom-thin-scrollbar p-3 flex flex-col gap-3">

              {/* Add Task Form (Only in TODO for Creator) */}
              {column.id === "TODO" && isCreator && (
                <CreateTaskForm
                  isAddingTask={isAddingTask} setIsAddingTask={setIsAddingTask}
                  newTaskTitle={newTaskTitle} setNewTaskTitle={setNewTaskTitle}
                  newTaskDescription={newTaskDescription} setNewTaskDescription={setNewTaskDescription}
                  handleCreateTask={handleCreateTask}
                  loading={loading}
                />
              )}

              {/* Render Cards */}
              <AnimatePresence>
                {filteredTasks.filter((task) => task.status === column.id).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task} column={column} COLUMNS={COLUMNS}
                    activeMenuTaskId={activeMenuTaskId} setActiveMenuTaskId={setActiveMenuTaskId}
                    setSelectedTask={setSelectedTask}
                    handleDragStart={handleDragStart} handleStatusChange={handleStatusChange}
                    members={members}
                  />
                ))}
              </AnimatePresence>

            </div>
          </div>
        ))}
      </div>

      {/* 3. TASK DETAILS MODAL */}
      <TaskDetailsModal
        selectedTask={selectedTask} setSelectedTask={setSelectedTask}
        handleUpdateTaskDetails={handleUpdateTaskDetails} handleDeleteTask={handleDeleteTask}
        isSaving={isSaving} isCreator={isCreator} members={members}
      />
    </div>
  );
}

const KanbanBoardSearchBar = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter
}: any) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-border/50 bg-background/40 backdrop-blur-md sticky top-0 z-10 shrink-0">
      <div className="relative w-full md:w-80 flex items-center">
        <Search size={16} className="absolute left-3 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-secondary/20 border border-border/50 rounded-md text-sm outline-none transition-all"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-secondary/20 border border-border/50 rounded-md px-3 py-1.5">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-background text-foreground">ALL</option>
            <option value="URGENT" className="bg-background text-foreground">URGENT</option>
            <option value="HIGH" className="bg-background text-foreground">HIGH</option>
            <option value="MEDIUM" className="bg-background text-foreground">MEDIUM</option>
            <option value="LOW" className="bg-background text-foreground">LOW</option>
          </select>
        </div>
      </div>
    </div>
  )
}

const ColumnHeader = ({
  column,
  index,
  COLUMNS_LENGTH,
  setActiveColIndex,
  taskCount
}: any) => {
  return (
    <div className="flex items-center justify-between p-4 shrink-0 border-b border-border/50 bg-background/50">

      {/* ⬅️ Mobile Navigation: PREVIOUS Button */}
      <button
        onClick={() => setActiveColIndex(index - 1)}
        className={`btn md:hidden p-1 text-muted-foreground ${index === 0 ? "invisible" : ""}`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Title & Count */}
      <div className="flex items-center gap-2 mx-auto md:mx-0">
        <h3 className={`font-bold text-[13px] tracking-wider uppercase ${column.headerText}`}>
          {column.title}
        </h3>
        <motion.span
          key={taskCount} // 👈 Count change hone par yeh animate hoga
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full"
        >
          {taskCount}
        </motion.span>
      </div>

      {/* ➡️ Mobile Navigation: NEXT Button */}
      <button
        onClick={() => setActiveColIndex(index + 1)}
        className={`btn md:hidden p-1 text-muted-foreground ${index === COLUMNS_LENGTH - 1 ? "invisible" : ""}`}
      >
        <ChevronRight size={20} />
      </button>

    </div>
  );
}

const CreateTaskForm = ({
  isAddingTask,
  setIsAddingTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  handleCreateTask,
  loading
}: any) => {
  return (
    <div className="mb-2">
      <AnimatePresence mode="wait">
        {isAddingTask ? (
          <motion.form key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleCreateTask} className="bg-card shadow-md rounded-sm p-4 flex flex-col border border-primary/40">

            <input autoFocus type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title..." className="w-full bg-transparent outline-none text-[14px] font-semibold text-foreground mb-2" />

            <div className="h-px w-full bg-border/40 mb-2" />

            <textarea value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} placeholder="Description..." rows={2} className="w-full bg-transparent outline-none text-xs text-muted-foreground resize-none custom-thin-scrollbar" />

            <div className="flex justify-end gap-2 mt-3 pt-2">

              <button type="button" onClick={() => setIsAddingTask(false)} className="btn text-xs px-3 py-1.5 text-muted-foreground hover:bg-secondary rounded-sm transition-colors">Cancel</button>

              <button type="submit" disabled={loading || !newTaskTitle.trim()} className="btn text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded-sm flex items-center gap-2 active:scale-95 transition-all">
                {loading ? <Loader2 size={12} className="animate-spin" /> : "Save"}
              </button>

            </div>
          </motion.form>
        ) : (
          <motion.button onClick={() => setIsAddingTask(true)} className="btn w-full flex justify-center items-center gap-2 px-3 py-3 border border-dashed border-border/60 hover:bg-secondary/30 text-muted-foreground transition-all">
            <Plus size={16} /> <span className="text-sm font-medium">NEW TODO</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

const TaskCard = ({
  task,
  column,
  activeMenuTaskId,
  setActiveMenuTaskId,
  setSelectedTask,
  handleDragStart,
  handleStatusChange,
  COLUMNS,
  members
}: any) => {
  const assigneeId = task.assigneeId?._id || task.assigneeId;
  const assignee = members.find((m: any) => m._id === assigneeId);

 
  const getColorClass = (name: string) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
  };

  return (
    <motion.div
      layout
      layoutId={task._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, layout: { duration: 0.3 } }}
      draggable
      onDragStart={(e: any) => handleDragStart(e, task._id)}
      className={`${column.cardBg} ${column.cardBorder} border shadow-sm rounded-md p-4 cursor-grab active:cursor-grabbing group relative flex flex-col gap-3 backdrop-blur-sm`}
    >
      {/* Desktop Drag Icon */}
      <div className="hidden md:block absolute top-4 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-muted-foreground/50">
        <GripVertical size={16} />
      </div>

      {/* Mobile Menu Button */}
      <button onClick={() => setActiveMenuTaskId(activeMenuTaskId === task._id ? null : task._id)} className="btn md:hidden absolute top-3 right-2 p-1 text-muted-foreground hover:bg-background/50 rounded-md">
        <MoreHorizontal size={18} />
      </button>

      {/* Clickable Area for Modal */}
      <div className="pr-6 cursor-pointer" onClick={() => setSelectedTask(task)}>
        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase mb-1.5 block">
          {task.ticketId}
        </span>
        <h4 className="text-sm font-medium text-foreground leading-snug">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider ${task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
            task.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
              task.priority === 'LOW' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                'bg-slate-500/10 text-slate-500 border border-slate-500/20'
            }`}>
            {task.priority || "MEDIUM"}
          </span>
          {task.description && <AlignLeft size={13} className="text-muted-foreground/60" />}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <div
            className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black overflow-hidden tracking-tighter ${getColorClass(assignee.name)}`}
            title={`Assigned to: ${assignee.name}`}
          >
            {getInitials(assignee.name)}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full border border-dashed border-border/60 bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground/50 overflow-hidden"
            title="Unassigned"
          >
            <User size={12} className="opacity-50" />
          </div>
        )}
      </div>

      {/* Mobile Actions Dropdown */}
      <AnimatePresence>
        {activeMenuTaskId === task._id && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="md:hidden mt-2 border-t border-border/50 flex flex-col gap-1 overflow-hidden">
            <div className="pt-3">
              <span className="text-[10px] font-medium text-muted-foreground px-1 mb-1 block">Move to...</span>
              <div className="grid grid-cols-2 gap-1.5">
                {COLUMNS.filter((c: any) => c.id !== task.status).map((c: any) => (
                  <button key={c.id} onClick={() => handleStatusChange(task._id, c.id)} className="btn text-[11px] py-2 px-2 bg-background hover:bg-secondary rounded-sm text-left flex items-center gap-1.5 font-medium text-muted-foreground border border-border/50">
                    <ChevronRight size={10} className={c.headerText} /> {c.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TaskDetailsModal = ({
  selectedTask,
  setSelectedTask,
  handleUpdateTaskDetails,
  handleDeleteTask,
  isSaving,
  isCreator,
  members
}: any) => {
  if (!selectedTask) return null; // Agar koi task select nahi hai, toh kuch mat dikhao

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTask(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-card border border-border/50 rounded-lg shadow-xl p-6 flex flex-col gap-4 z-10">

          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase">{selectedTask.ticketId}</span>
            <button onClick={() => setSelectedTask(null)} className="btn p-1.5 text-muted-foreground hover:bg-secondary rounded-md"><X size={18} /></button>
          </div>

          <form onSubmit={handleUpdateTaskDetails} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input type="text" value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} disabled={!isCreator} className="w-full bg-secondary/30 outline-none border border-border/50 rounded px-3 py-2 text-sm disabled:opacity-50" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea value={selectedTask.description} onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })} rows={4} disabled={!isCreator} className="w-full bg-secondary/30 outline-none border border-border/50 rounded px-3 py-2 text-sm resize-none disabled:opacity-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <select value={selectedTask.priority} onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })} disabled={!isCreator} className="w-full bg-secondary/30 text-foreground outline-none border border-border/50 rounded px-3 py-2 text-sm disabled:opacity-50">
                  <option value="LOW" className="bg-card text-foreground">LOW</option>
                  <option value="MEDIUM" className="bg-card text-foreground">MEDIUM</option>
                  <option value="HIGH" className="bg-card text-foreground">HIGH</option>
                  <option value="URGENT" className="bg-card text-foreground">URGENT</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assign To</label>
                <select value={selectedTask.assigneeId || ""} onChange={(e) => setSelectedTask({ ...selectedTask, assigneeId: e.target.value })} disabled={!isCreator} className="w-full bg-secondary/30 text-foreground outline-none border border-border/50 rounded px-3 py-2 text-sm disabled:opacity-50">
                  <option value="" className="bg-card text-foreground">Unassigned</option>
                  {members.map((member: any) => (
                    <option key={member._id} value={member._id} className="bg-card text-foreground">{member.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              {isCreator ? (
                <button type="button" onClick={handleDeleteTask} className="btn flex items-center gap-2 text-xs font-medium text-red-500 hover:bg-red-500/10 px-3 py-2 rounded"><Trash2 size={14} /> Delete</button>
              ) : <div></div>}

              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedTask(null)} className="btn text-xs font-medium px-4 py-2 hover:bg-secondary rounded text-muted-foreground">Cancel</button>
                {isCreator && (
                  <button type="submit" disabled={isSaving} className="btn flex items-center gap-2 text-xs font-medium px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                  </button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}