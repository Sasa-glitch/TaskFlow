import { useState } from "react";
import type { Task } from "../TaskManager/TaskManager";

interface TaskProps {
    task: Task;
    index: number;
    onDelete: (id: number, url: string | null) => Promise<void> | void;
    onUpdate: (
        id: number,
        title: string,
        description: string,
        newImageUrl?: string | null,
    ) => Promise<void> | void;
    onFinish: (id: number, isFinished: boolean) => Promise<void> | void;
    deleteImage: (url: string) => Promise<void> | void;
    uploadImage: (file: File) => Promise<string | null> | void;
}

function TaskComponent({
    task,
    index,
    onDelete,
    onUpdate,
    onFinish,
    deleteImage,
    uploadImage,
}: TaskProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // —— Handle Changing Image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewImageFile(file);
            if (newImagePreview) URL.revokeObjectURL(newImagePreview);
            setNewImagePreview(URL.createObjectURL(file));
        }
    };

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

        let newUrl: string | null | undefined = undefined;

        if (newImageFile) {
            setIsUploadingImage(true);
            const uploaded = (await uploadImage(newImageFile)) as string | null;
            if (uploaded) {
                // delete old image if exists
                if (task.image_url) await deleteImage(task.image_url);
                newUrl = uploaded;
            }
            setIsUploadingImage(false);
        }

        await onUpdate(task.id, editTitle, editDescription, newUrl);
        setNewImageFile(null);
        if (newImagePreview) {
            URL.revokeObjectURL(newImagePreview);
            setNewImagePreview(null);
        }
        setIsEditing(false);
    };

    return (
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
                            <div className="mt-3 relative rounded-lg overflow-hidden border border-(--color-border) bg-(--color-surface-elevated) max-w-full sm:max-w-md aspect-video sm:aspect-auto sm:max-h-64 cursor-pointer group shadow-sm transition-all duration-300 hover:shadow-md hover:border-(--color-accent-border)">
                                <img
                                    src={task.image_url}
                                    alt={task.title}
                                    className={`w-full h-full object-cover transition-transform duration-300 ${task.finished ? " blur-sm brightness-60 grayscale " : " group-hover:scale-[1.02]"}`}
                                    onClick={() =>
                                        setSelectedImage(task.image_url)
                                    }
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
                            title={
                                task.finished
                                    ? "Mark as Incomplete"
                                    : "Mark as Completed"
                            }
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
                            onClick={() => onDelete(task.id, task.image_url)}
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
                        {/* Image Edit Section */}
                        <div className="flex flex-col gap-2 mt-1">
                            <span className="input-label">Update Image</span>

                            {/* Show new preview OR current image */}
                            {newImagePreview ? (
                                <div className="relative group rounded-lg overflow-hidden border border-(--color-border) max-w-xs aspect-video bg-(--color-surface-elevated)">
                                    <img
                                        src={newImagePreview}
                                        className="w-full h-full object-cover"
                                        alt="New preview"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewImageFile(null);
                                                if (newImagePreview)
                                                    URL.revokeObjectURL(
                                                        newImagePreview,
                                                    );
                                                setNewImagePreview(null);
                                            }}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line
                                                    x1="18"
                                                    y1="6"
                                                    x2="6"
                                                    y2="18"
                                                />
                                                <line
                                                    x1="6"
                                                    y1="6"
                                                    x2="18"
                                                    y2="18"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : task.image_url ? (
                                <div className="relative group rounded-lg overflow-hidden border border-(--color-border) max-w-xs aspect-video bg-(--color-surface-elevated)">
                                    <img
                                        src={task.image_url}
                                        className="w-full h-full object-cover opacity-60"
                                        alt="Current"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <label
                                            htmlFor={`edit-file-${task.id}`}
                                            className="px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg cursor-pointer transition-colors"
                                        >
                                            Replace Image
                                        </label>
                                    </div>
                                    <input
                                        type="file"
                                        id={`edit-file-${task.id}`}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            ) : (
                                <label
                                    htmlFor={`edit-file-${task.id}`}
                                    className="border-2 border-dashed border-(--color-border) hover:border-(--color-border-focus) rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer bg-(--color-surface-elevated) transition-all"
                                >
                                    <input
                                        type="file"
                                        id={`edit-file-${task.id}`}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <svg
                                        className="w-5 h-5 text-(--color-text-secondary)"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="3"
                                            width="18"
                                            height="18"
                                            rx="2"
                                        />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span className="text-xs text-(--color-text-secondary)">
                                        Add image
                                    </span>
                                </label>
                            )}
                        </div>
                        <button
                            id={`proceed-edit-btn-${task.id}`}
                            className="btn-success self-end"
                            onClick={handleProceedEdit}
                            disabled={!editTitle.trim() || isUploadingImage}
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
                            {isUploadingImage
                                ? "Uploading..."
                                : "Proceed to Edit"}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Image Lightbox Modal ── */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in cursor-zoom-out"
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
