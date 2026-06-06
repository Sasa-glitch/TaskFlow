import { useState } from "react";
import type { Task } from "../TaskManager/TaskManager";

interface TaskProps {
    task: Task;
    index: number;
    onDelete: (id: number) => Promise<void> | void;
    onUpdate: (
        id: number,
        title: string,
        description: string,
    ) => Promise<void> | void;
    onFinish : (
        id: number,
        isFinished: boolean,
    ) => Promise<void> | void;
}

function TaskComponent({ task, index, onDelete, onUpdate, onFinish }: TaskProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleEditClick = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            setEditTitle(task.title);
            setEditDescription(task.description);
            setIsEditing(true);
        }
    };

    const handleProceedEdit = async () => {
        if (!editTitle.trim()) return;
        await onUpdate(task.id, editTitle, editDescription);
        setIsEditing(false);
    };

    return (
        // TODO task now has image please handle showing the image in the content seamlessly with the current design and respect all screens
        <div
            className={`card animate-fade-in transition-all duration-300 ${
                task.finished ? "opacity-60 border-success/30 shadow-none" : ""
            }`}
            style={{
                animationDelay: `${index * 0.05}s`,
            }}
        >
            <div className="card-body">
                {/* ── Task Content Row ── */}
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3
                                className={`text-base font-semibold truncate transition-all duration-300 ${
                                    task.finished ? "line-through" : ""
                                }`}
                                style={{
                                    color: task.finished
                                        ? "var(--color-text-muted)"
                                        : "var(--color-text-primary)",
                                }}
                            >
                                {task.title}
                            </h3>
                            {task.finished && (
                                <span className="badge-success gap-1 text-[10px] py-0.5 px-2">
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Done
                                </span>
                            )}
                        </div>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                color: task.finished
                                    ? "var(--color-text-muted)"
                                    : "var(--color-text-secondary)",
                            }}
                        >
                            {task.description || "No description"}
                        </p>
                        {task.image_url && (
                            <div className="mt-3 relative rounded-lg overflow-hidden border border-(--color-border) bg-(--color-surface-elevated) max-w-full sm:max-w-md aspect-video sm:aspect-auto sm:max-h-64 cursor-pointer group shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--color-accent-border)]">
                                <img
                                    src={task.image_url}
                                    alt={task.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    onClick={() => setSelectedImage(task.image_url)}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 lg:mt-0 w-full lg:w-auto justify-end shrink-0">
                        {/* Finish/Unfinish Button */}
                        <button
                            id={`finish-btn-${task.id}`}
                            className={`btn-sm ${
                                task.finished ? "btn-ghost" : "btn-success"
                            }`}
                            onClick={() => onFinish(task.id, task.finished)}
                            title={task.finished ? "Mark as Incomplete" : "Mark as Completed"}
                        >
                            {task.finished ? (
                                <>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <polyline points="3 3 3 8 8 8" />
                                    </svg>
                                    Undo
                                </>
                            ) : (
                                <>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Finish
                                </>
                            )}
                        </button>

                        {/* Edit Button */}
                        <button
                            id={`edit-btn-${task.id}`}
                            className={`btn-sm ${
                                isEditing ? "btn-ghost" : "btn-edit"
                            }`}
                            onClick={handleEditClick}
                        >
                            {isEditing ? (
                                <>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit
                                </>
                            )}
                        </button>

                        {/* Delete Button */}
                        <button
                            id={`delete-btn-${task.id}`}
                            className="btn-sm btn-danger"
                            onClick={() => onDelete(task.id)}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>

                {/* ── Edit Panel (Two-step) ── */}
                {isEditing && (
                    <div className="edit-panel">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <label
                                    htmlFor={`updateTitle-${task.id}`}
                                    className="input-label"
                                >
                                    Update Title
                                </label>
                                <input
                                    type="text"
                                    id={`updateTitle-${task.id}`}
                                    className="input-field"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <label
                                    htmlFor={`updateDescription-${task.id}`}
                                    className="input-label"
                                >
                                    Update Description
                                </label>
                                <input
                                    type="text"
                                    id={`updateDescription-${task.id}`}
                                    className="input-field"
                                    value={editDescription}
                                    onChange={(e) =>
                                        setEditDescription(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <button
                            id={`proceed-edit-btn-${task.id}`}
                            className="btn-success self-end"
                            onClick={handleProceedEdit}
                            disabled={!editTitle.trim()}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Proceed to Edit
                        </button>
                    </div>
                )}
            </div>
            
            {/* ── Image Lightbox Modal ── */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                        <button
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors duration-200 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            title="Close modal"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full Screen Preview"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-lg cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskComponent;
